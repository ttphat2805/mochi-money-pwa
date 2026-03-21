import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { getCurrentMonthString, getLast6Months, getMonthLabel } from '@/lib/utils'
import { useCategoryStore } from '@/stores/categoryStore'
import type { BudgetCategory, FinancialSettings } from '@/types'

// ── Chart-ready types ─────────────────────────────────────────

export interface DonutSlice {
  name: string; value: number; color: string; icon: string; pct: number
}
export interface BarMonthDatum {
  monthLabel: string; monthKey: string; total: number
}
export interface TopCategoryItem {
  category: BudgetCategory; total: number; pct: number
}
export interface DailyDatum { day: number; amount: number }

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

  const daysInMonth = useMemo(() => {
    const [y, m] = currentMonthKey.split('-').map(Number)
    return new Date(y, m, 0).getDate()
  }, [currentMonthKey])

  const dailyData = useMemo<DailyDatum[]>(() => {
    const acc: Record<number, number> = {}
    for (const tx of monthTxs) {
      const d = parseInt(tx.date.slice(8, 10), 10)
      acc[d] = (acc[d] ?? 0) + tx.amount
    }
    return Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, amount: acc[i + 1] ?? 0 }))
  }, [monthTxs, daysInMonth])

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

  // Daily budget from settings
  const dailyBudget = useMemo(() => {
    if (!settings?.income) return undefined
    const fixed = 0 // simplified — no fixed expenses here
    const flex = settings.income - (settings.savingTarget ?? 0) - fixed
    const days = daysInMonth
    return Math.round(flex / days)
  }, [settings, daysInMonth])

  return {
    currentMonthKey, monthTotal, settings: settings ?? null,
    categoryTotals, dailyData, donutData, topCategories,
    barData, dailyBudget, selectedTrendCatIds, setSelectedTrendCatIds,
    isLoading: false, // In a real app with more complex loading logic, this might be dynamic. LiveQuery defaults to undefined initially.
  }
}
