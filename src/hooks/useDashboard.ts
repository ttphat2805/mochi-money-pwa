import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { getCurrentMonthString, getDaysInMonth, getLast6Months, getMonthLabel, getLast7Days, getShortWeekday, getTodayString } from '@/lib/utils'
import { getMonthlyBudget } from '@/lib/budget'
import { useCategoryStore } from '@/stores/categoryStore'
import type { BudgetCategory, FinancialSettings, Transaction } from '@/types'

function getPrevMonthKey(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number)
  if (m === 1) return `${y - 1}-12`
  return `${y}-${String(m - 1).padStart(2, '0')}`
}

function getLast4Months(currentMonthKey: string): string[] {
  const months: string[] = [currentMonthKey]
  for (let i = 0; i < 3; i++) {
    months.unshift(getPrevMonthKey(months[0]))
  }
  return months
}

// ── Chart-ready types ─────────────────────────────────────────

export interface DonutSlice {
  name: string; value: number; color: string; icon: string; pct: number
}
export interface BarMonthDatum {
  monthLabel: string; monthKey: string; total: number
}
export interface BarWeekDatum {
  dayLabel: string; dateStr: string; amount: number; isToday: boolean
}
export interface Bar4MonthDatum {
  monthLabel: string; monthKey: string; amount: number; isCurrentMonth: boolean
}
export interface TopCategoryItem {
  category: BudgetCategory; total: number; pct: number
}

const EMPTY_TXS: Transaction[] = []
const EMPTY_BAR_DATA: BarMonthDatum[] = []
const EMPTY_BAR_4_DATA: Bar4MonthDatum[] = []

// ── Hook ──────────────────────────────────────────────────────

export function useDashboard() {
  const currentMonthKey = getCurrentMonthString()
  const { categories } = useCategoryStore()
  const [selectedTrendCatIds, setSelectedTrendCatIds] = useState<number[]>([])

  const catMap = useMemo(() => {
    const m = new Map<number, BudgetCategory>()
    for (const c of categories) { if (c.id != null) m.set(c.id, c) }
    return m
  }, [categories])

  // `?? null` inside the query so `undefined` only ever means "still loading"
  const settingsRaw = useLiveQuery<FinancialSettings | null>(
    () => db.settings.toCollection().first().then((s) => s ?? null),
    [],
  )

  // This month's extra incomes (part of the budget, see lib/budget.ts)
  const extraIncomeRaw = useLiveQuery(
    async () => {
      const rows = await db.extraIncomes.where('monthKey').equals(currentMonthKey).toArray()
      return rows.reduce((s, e) => s + e.amount, 0)
    },
    [currentMonthKey],
  )
  const extraIncome = extraIncomeRaw ?? 0

  // This month's transactions
  const monthTxsRaw = useLiveQuery(
    () =>
      db.transactions
        .where('date').between(currentMonthKey + '-01', currentMonthKey + '-32', true, false)
        .filter((tx) => !tx.deletedAt && !tx.isNote)
        .toArray(),
    [currentMonthKey],
  )
  const monthTxs = monthTxsRaw ?? EMPTY_TXS

  const categoryTotals = useMemo(() => {
    const acc = new Map<number, number>()
    for (const tx of monthTxs) acc.set(tx.categoryId, (acc.get(tx.categoryId) ?? 0) + tx.amount)
    return acc
  }, [monthTxs])

  const monthTotal = useMemo(
    () => [...categoryTotals.values()].reduce((s, v) => s + v, 0),
    [categoryTotals],
  )



  const donutData = useMemo<DonutSlice[]>(
    () =>
      [...categoryTotals.entries()]
        .map(([catId, total]) => {
          const cat = catMap.get(catId)
          return { name: cat?.name ?? '?', value: total, color: cat?.color ?? '#94A3B8', icon: cat?.icon ?? 'package', pct: monthTotal > 0 ? Math.round((total / monthTotal) * 100) : 0 }
        })
        .sort((a, b) => b.value - a.value),
    [categoryTotals, monthTotal, catMap],
  )

  const topCategories = useMemo<TopCategoryItem[]>(
    () =>
      [...categoryTotals.entries()]
        .map(([catId, total]) => ({ category: catMap.get(catId)!, total, pct: monthTotal > 0 ? Math.round((total / monthTotal) * 100) : 0 }))
        .filter((i) => i.category != null)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5),
    [categoryTotals, monthTotal, catMap],
  )

  // 6-month history
  const sixMonthKeys = useMemo(() => getLast6Months(), [])

  const barData = useLiveQuery<BarMonthDatum[]>(
    async () => {
      const results = await Promise.all(
        sixMonthKeys.map(async (monthKey) => {
          const txs = await db.transactions
            .where('date').between(monthKey + '-01', monthKey + '-32', true, false)
            .filter((tx) => !tx.deletedAt && !tx.isNote).toArray()
          return { monthLabel: getMonthLabel(monthKey), monthKey, total: txs.reduce((s, t) => s + t.amount, 0) }
        }),
      )
      return results
    },
    [sixMonthKeys],
  ) ?? EMPTY_BAR_DATA

  // Last 4 months bar data (prev 3 + current)
  const last4MonthKeys = useMemo(() => getLast4Months(currentMonthKey), [currentMonthKey])

  const last4MonthsBarRaw = useLiveQuery<Bar4MonthDatum[]>(
    async () => {
      const results = await Promise.all(
        last4MonthKeys.map(async (monthKey) => {
          const txs = await db.transactions
            .where('date').between(monthKey + '-01', monthKey + '-32', true, false)
            .filter((tx) => !tx.deletedAt && !tx.isNote).toArray()
          const amount = txs.reduce((s, t) => s + t.amount, 0)
          return {
            monthLabel: getMonthLabel(monthKey),
            monthKey,
            amount,
            isCurrentMonth: monthKey === currentMonthKey,
          }
        }),
      )
      return results
    },
    [last4MonthKeys, currentMonthKey],
  )
  const last4MonthsBar = last4MonthsBarRaw ?? EMPTY_BAR_4_DATA

  // Last 7 days bar data
  const last7DaysKeys = useMemo(() => getLast7Days(), [])
  const todayStr = getTodayString()

  const weeklyBarData = useLiveQuery<BarWeekDatum[]>(
    async () => {
      const results = await Promise.all(
        last7DaysKeys.map(async (dateStr) => {
          const txs = await db.transactions
            .where('date').equals(dateStr)
            .filter((tx) => !tx.deletedAt && !tx.isNote).toArray()
          const amount = txs.reduce((s, t) => s + t.amount, 0)
          return {
            dayLabel: getShortWeekday(dateStr),
            dateStr,
            amount,
            isToday: dateStr === todayStr,
          }
        }),
      )
      return results
    },
    [last7DaysKeys, todayStr],
  ) ?? []

  // Last month, same period (day 1 … min(today, last month's length)), so
  // month-to-date is compared like for like instead of against a full month
  const todayDay = Number(todayStr.slice(8, 10))
  const prevMonthKey = getPrevMonthKey(currentMonthKey)
  const lastMonthSamePeriodEnd = useMemo(() => {
    const [py, pm] = prevMonthKey.split('-').map(Number)
    const endDay = Math.min(todayDay, getDaysInMonth(py, pm))
    return `${prevMonthKey}-${String(endDay).padStart(2, '0')}`
  }, [prevMonthKey, todayDay])

  const lastMonthSamePeriodRaw = useLiveQuery(
    async () => {
      const txs = await db.transactions
        .where('date').between(prevMonthKey + '-01', lastMonthSamePeriodEnd, true, true)
        .filter((tx) => !tx.deletedAt && !tx.isNote).toArray()
      return txs.reduce((s, t) => s + t.amount, 0)
    },
    [prevMonthKey, lastMonthSamePeriodEnd],
  )

  const settings = settingsRaw ?? null
  const monthlyBudget = useMemo(
    () => getMonthlyBudget({ income: settings?.income, extraIncome, savingTarget: settings?.savingTarget }),
    [settings, extraIncome],
  )

  const lastMonthTotal = useMemo(() => {
    if (!last4MonthsBar.length) return 0
    const prev = last4MonthsBar.find(d => d.monthKey === getPrevMonthKey(currentMonthKey))
    return prev?.amount ?? 0
  }, [last4MonthsBar, currentMonthKey])


  return {
    currentMonthKey, monthTotal, settings,
    extraIncome, monthlyBudget,
    categoryTotals, donutData, topCategories,
    barData, last4MonthsBar, lastMonthTotal, weeklyBarData,
    lastMonthSamePeriodTotal: lastMonthSamePeriodRaw ?? 0,
    selectedTrendCatIds, setSelectedTrendCatIds,
    // Everything the Overview renders up-front (raw live-query results)
    isLoading:
      settingsRaw === undefined ||
      extraIncomeRaw === undefined ||
      monthTxsRaw === undefined ||
      lastMonthSamePeriodRaw === undefined ||
      last4MonthsBarRaw === undefined,
  }
}
