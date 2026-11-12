import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { getTodayString } from '@/lib/utils'
import { useCategoryStore } from '@/stores/categoryStore'
import type { BudgetCategory, Transaction } from '@/types'

const EMPTY_TXS: Transaction[] = []

// ── Types ─────────────────────────────────────────────────────

export type CalendarDayCell =
  | { type: 'empty'; key: string }
  | { type: 'day'; date: string; day: number; isToday: boolean; isFuture: boolean }

export interface MonthStats {
  total: number
  avgPerDay: number
  maxDay: string | null   // 'YYYY-MM-DD'
  maxDayAmount: number
}

// ── Constants ─────────────────────────────────────────────────

export const HEAT_BG = [
  'rgba(0,0,0,0.04)',        // 0 — no spend: subtle cell shape
  'var(--color-accent-h1)',
  'var(--color-accent-h2)',
  'var(--color-accent-h3)',
  'var(--color-accent-h4)',
] as const
export const HEAT_TEXT = [
  'var(--color-text-muted)', // 0 — no spend
  'var(--color-accent-dark)',
  'var(--color-accent-dark)',
  'var(--color-accent-dark)',
  '#FFFFFF',
] as const

const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
]

// ── Helpers ───────────────────────────────────────────────────

/**
 * Heat level 0–4 for a day's spend. `scaleMax` should come from
 * `getHeatScaleMax` (a robust cap), so amounts at/above it get level 4.
 */
export function getHeatLevel(amount: number, scaleMax: number): 0 | 1 | 2 | 3 | 4 {
  if (amount <= 0 || scaleMax <= 0) return 0
  const ratio = amount / scaleMax
  if (ratio < 0.25) return 1
  if (ratio < 0.50) return 2
  if (ratio < 0.75) return 3
  return 4
}

/**
 * Robust heatmap ceiling: ~90th percentile (nearest-rank) of non-zero daily
 * totals. One rent-sized outlier then gets level 4 instead of flattening
 * every other day into level 1. Month has ≤31 values, so sorting is cheap.
 */
export function getHeatScaleMax(totals: readonly number[]): number {
  const nonZero = totals.filter((v) => v > 0).sort((a, b) => a - b)
  if (nonZero.length === 0) return 0
  return nonZero[Math.ceil(nonZero.length * 0.9) - 1]
}

function generateCalendarDays(year: number, month: number, today: string): CalendarDayCell[] {
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  let offset = firstDay.getDay() - 1 // Monday-first
  if (offset < 0) offset = 6

  const cells: CalendarDayCell[] = []

  for (let i = 0; i < offset; i++) cells.push({ type: 'empty', key: `empty-${i}` })

  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ type: 'day', date, day: d, isToday: date === today, isFuture: date > today })
  }

  return cells
}

// ── Hook ──────────────────────────────────────────────────────

export function useCalendar() {
  // ── Today — refreshed when the app returns to foreground (midnight rollover) ──
  const [today, setToday] = useState(getTodayString)

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') setToday(getTodayString())
    }
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  const todayYear = parseInt(today.slice(0, 4), 10)
  const todayMonth = parseInt(today.slice(5, 7), 10) - 1

  const [view, setView] = useState({ year: todayYear, month: todayMonth })
  const { year: viewYear, month: viewMonth } = view
  const [selectedDay, setSelectedDay] = useState<string | null>(today)

  const { categories } = useCategoryStore()

  const viewMonthKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`
  const monthLabel = `${MONTH_NAMES[viewMonth]} · ${viewYear}`
  const canGoNext = viewYear < todayYear + 10 // Allow scheduling up to 10 years in the future
  const canGoPrev = true
  const isCurrentMonth = viewMonthKey === today.slice(0, 7)

  const goToPrevMonth = useCallback(() => {
    setView(({ year, month }) => (month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }))
    setSelectedDay(null)
  }, [])

  const goToNextMonth = useCallback(() => {
    if (!canGoNext) return
    setView(({ year, month }) => (month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }))
    setSelectedDay(null)
  }, [canGoNext])

  /** Tap on a day: select it, or deselect when tapped again (stable for memoized cells) */
  const toggleSelectedDay = useCallback((date: string) => {
    setSelectedDay((prev) => (prev === date ? null : date))
  }, [])

  // ── Reactive DB query ──
  // Includes notes (shown in the day panel); totals below exclude them.
  // Result is tagged with its month so a stale result (dexie keeps the previous
  // value while the new month's query runs) is never mistaken for "no data".

  const monthResult = useLiveQuery(
    async () => ({
      key: viewMonthKey,
      txs: await db.transactions
        .where('date')
        .between(viewMonthKey + '-01', viewMonthKey + '-32', true, false)
        .filter((tx) => !tx.deletedAt)
        .toArray(),
    }),
    [viewMonthKey],
  )
  const isLoading = monthResult === undefined
  /** Month the shown numbers belong to — lags viewMonthKey for a frame on month change */
  const dataMonthKey = monthResult?.key ?? viewMonthKey
  const monthTxs = monthResult?.txs ?? EMPTY_TXS

  const catMap = useMemo(() => {
    const m = new Map<number, BudgetCategory>()
    for (const c of categories) { if (c.id != null) m.set(c.id, c) }
    return m
  }, [categories])

  const dailyTotals = useMemo(
    () => monthTxs.reduce<Record<string, number>>((acc, tx) => {
      if (tx.isNote) return acc
      acc[tx.date] = (acc[tx.date] ?? 0) + tx.amount
      return acc
    }, {}),
    [monthTxs],
  )

  const heatScaleMax = useMemo(
    () => getHeatScaleMax(Object.values(dailyTotals)),
    [dailyTotals],
  )

  const selectedDayTxs = useMemo(
    () =>
      (selectedDay ? monthTxs.filter((tx) => tx.date === selectedDay) : [])
        .map((tx) => ({ ...tx, category: catMap.get(tx.categoryId) })),
    [monthTxs, selectedDay, catMap],
  )

  const monthStats = useMemo<MonthStats>(() => {
    const entries = Object.entries(dailyTotals)
    let total = 0
    let daysWithSpending = 0
    let maxEntry: [string, number] | null = null
    for (const entry of entries) {
      total += entry[1]
      if (entry[1] > 0) daysWithSpending++
      if (!maxEntry || entry[1] > maxEntry[1]) maxEntry = entry
    }
    const avgPerDay = daysWithSpending > 0 ? Math.round(total / daysWithSpending) : 0
    return { total, avgPerDay, maxDay: maxEntry?.[0] ?? null, maxDayAmount: maxEntry?.[1] ?? 0 }
  }, [dailyTotals])

  const calendarDays = useMemo(
    () => generateCalendarDays(viewYear, viewMonth, today),
    [viewYear, viewMonth, today],
  )

  const goToToday = useCallback(() => {
    setView({ year: todayYear, month: todayMonth })
    setSelectedDay(today)
  }, [todayYear, todayMonth, today])

  return {
    today,
    viewYear,
    viewMonth,
    viewMonthKey,
    dataMonthKey,
    monthLabel,
    isCurrentMonth,
    canGoNext,
    canGoPrev,
    selectedDay,
    setSelectedDay,
    toggleSelectedDay,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    dailyTotals,
    heatScaleMax,
    selectedDayTxs,
    monthStats,
    calendarDays,
    isLoading,
  }
}
