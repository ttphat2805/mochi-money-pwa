import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { getCurrentMonthString, getLast6Months, getMonthLabel } from '@/lib/utils'
import { useCategoryStore } from '@/stores/categoryStore'
import type { BudgetCategory, FinancialSettings } from '@/types'

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
export interface Bar4MonthDatum {
  monthLabel: string; monthKey: string; amount: number; isCurrentMonth: boolean
}
export interface TopCategoryItem {
  category: BudgetCategory; total: number; pct: number
}

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

  const settings = useLiveQuery<FinancialSettings | undefined>(
    () => db.settings.toCollection().first(),
    [],
  )

  // This month's transactions
  const monthTxs = useLiveQuery(
    () =>
      db.transactions
        .where('date').between(currentMonthKey + '-01', currentMonthKey + '-32', true, false)
        .filter((tx) => !tx.deletedAt)
        .toArray(),
    [currentMonthKey],
  ) ?? []

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
          return { name: cat?.name ?? '?', value: total, color: cat?.color ?? '#888', icon: cat?.icon ?? '📦', pct: monthTotal > 0 ? Math.round((total / monthTotal) * 100) : 0 }
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
            .filter((tx) => !tx.deletedAt).toArray()
          return { monthLabel: getMonthLabel(monthKey), monthKey, total: txs.reduce((s, t) => s + t.amount, 0) }
        }),
      )
      return results
    },
    [sixMonthKeys],
  ) ?? []

  // Last 4 months bar data (prev 3 + current)
  const last4MonthKeys = useMemo(() => getLast4Months(currentMonthKey), [currentMonthKey])

  const last4MonthsBar = useLiveQuery<Bar4MonthDatum[]>(
    async () => {
      const results = await Promise.all(
        last4MonthKeys.map(async (monthKey) => {
          const txs = await db.transactions
            .where('date').between(monthKey + '-01', monthKey + '-32', true, false)
            .filter((tx) => !tx.deletedAt).toArray()
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
  ) ?? []

  const lastMonthTotal = useMemo(() => {
    if (!last4MonthsBar.length) return 0
    const prev = last4MonthsBar.find(d => d.monthKey === getPrevMonthKey(currentMonthKey))
    return prev?.amount ?? 0
  }, [last4MonthsBar, currentMonthKey])


  return {
    currentMonthKey, monthTotal, settings: settings ?? null,
    categoryTotals, donutData, topCategories,
    barData, last4MonthsBar, lastMonthTotal,
    selectedTrendCatIds, setSelectedTrendCatIds,
    isLoading: false,
  }
}
