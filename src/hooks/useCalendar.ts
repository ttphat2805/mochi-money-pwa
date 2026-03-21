import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { getTodayString } from '@/lib/utils'
import { useCategoryStore } from '@/stores/categoryStore'
import type { BudgetCategory } from '@/types'

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

export const HEAT_BG = ['transparent', '#FFF4E0', '#FDDFA0', '#F5C043', '#E8A020'] as const
export const HEAT_TEXT = [
  'var(--color-text-muted)', '#8B5E10', '#7A4E08', '#5A3405', '#FFFFFF',
] as const

const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
]

// ── Helpers ───────────────────────────────────────────────────

export function getHeatLevel(amount: number, maxAmount: number): 0 | 1 | 2 | 3 | 4 {
  if (amount === 0 || maxAmount === 0) return 0
  const ratio = amount / maxAmount
  if (ratio < 0.25) return 1
  if (ratio < 0.50) return 2
  if (ratio < 0.75) return 3
  return 4
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
  const today = getTodayString()
  const todayYear = parseInt(today.slice(0, 4), 10)
  const todayMonth = parseInt(today.slice(5, 7), 10) - 1

  const [viewYear, setViewYear] = useState(todayYear)
  const [viewMonth, setViewMonth] = useState(todayMonth)
  const [selectedDay, setSelectedDay] = useState<string | null>(today)

  const { categories } = useCategoryStore()

  const viewMonthKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`
  const monthLabel = `${MONTH_NAMES[viewMonth]} · ${viewYear}`
  const canGoNext = viewYear < todayYear || (viewYear === todayYear && viewMonth < todayMonth)

  const goToPrevMonth = () => {
    setViewMonth((prev) => {
      if (prev === 0) { setViewYear((y) => y - 1); return 11 }
      return prev - 1
    })
    setSelectedDay(null)
  }

  const goToNextMonth = () => {
    if (!canGoNext) return
    setViewMonth((prev) => {
      if (prev === 11) { setViewYear((y) => y + 1); return 0 }
      return prev + 1
    })
    setSelectedDay(null)
  }

  // ── Reactive DB query ──

  const monthTxs = useLiveQuery(
    () =>
      db.transactions
        .where('date')
        .between(viewMonthKey + '-01', viewMonthKey + '-32', true, false)
        .filter((tx) => !tx.deletedAt)
        .toArray(),
    [viewMonthKey],
  ) ?? []

  const catMap = useMemo(() => {
    const m = new Map<number, BudgetCategory>()
    for (const c of categories) { if (c.id != null) m.set(c.id, c) }
    return m
  }, [categories])

  const dailyTotals = useMemo(
    () => monthTxs.reduce<Record<string, number>>((acc, tx) => {
      acc[tx.date] = (acc[tx.date] ?? 0) + tx.amount
      return acc
    }, {}),
    [monthTxs],
  )

  const maxDailyAmount = useMemo(
    () => Math.max(0, ...Object.values(dailyTotals)),
    [dailyTotals],
  )

  const selectedDayTxs = useMemo(
    () =>
      (selectedDay ? monthTxs.filter((tx) => tx.date === selectedDay) : [])
        .map((tx) => ({ ...tx, category: catMap.get(tx.categoryId) })),
    [monthTxs, selectedDay, catMap],
  )

  const monthStats = useMemo<MonthStats>(() => {
    const total = Object.values(dailyTotals).reduce((a, b) => a + b, 0)
    const daysWithSpending = Object.values(dailyTotals).filter((v) => v > 0)
    const avgPerDay = daysWithSpending.length > 0 ? Math.round(total / daysWithSpending.length) : 0
    const maxEntry = Object.entries(dailyTotals).sort(([, a], [, b]) => b - a)[0]
    return { total, avgPerDay, maxDay: maxEntry?.[0] ?? null, maxDayAmount: maxEntry?.[1] ?? 0 }
  }, [dailyTotals])

  const calendarDays = useMemo(
    () => generateCalendarDays(viewYear, viewMonth, today),
    [viewYear, viewMonth, today],
  )

  return {
    today,
    viewYear,
    viewMonth,
    viewMonthKey,
    monthLabel,
    canGoNext,
    selectedDay,
    setSelectedDay,
    goToPrevMonth,
    goToNextMonth,
    dailyTotals,
    maxDailyAmount,
    selectedDayTxs,
    monthStats,
    calendarDays,
    isLoading: monthTxs == null,
  }
}
