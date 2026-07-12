import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { getCurrentMonthString, getMonthLabel, sumSpent } from '@/lib/utils'
import { useCategoryStore } from '@/stores/categoryStore'
import type { BudgetCategory, Transaction } from '@/types'

// ── Past 12 months as selectable month keys ────────────────────

function getLast12Months(): string[] {
  const today = new Date()
  const result: string[] = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    result.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return result
}

export interface TransactionWithCategory extends Transaction {
  category: BudgetCategory | undefined
}

export function useHistory() {
  const currentMonthKey = getCurrentMonthString()
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)

  const { categories } = useCategoryStore()

  const catMap = useMemo(() => {
    const m = new Map<number, BudgetCategory>()
    for (const c of categories) {
      if (c.id != null) m.set(c.id, c)
    }
    return m
  }, [categories])

  // All available month keys for the month picker
  const monthKeys = useMemo(() => getLast12Months(), [])

  // Single live query per month. Category filtering happens client-side
  // below, so tapping a filter chip never re-queries the DB (no skeleton
  // flash, instant response).
  const monthTransactions = useLiveQuery(async () => {
    const txs = await db.transactions
      .where('date')
      .startsWith(selectedMonth)
      .filter((tx) => !tx.deletedAt)
      .toArray()

    return txs.sort(
      (a, b) =>
        b.date.localeCompare(a.date) ||
        b.createdAt.localeCompare(a.createdAt),
    )
  }, [selectedMonth])

  const monthWithCategory = useMemo<TransactionWithCategory[]>(
    () => (monthTransactions ?? []).map((tx) => ({ ...tx, category: catMap.get(tx.categoryId) })),
    [monthTransactions, catMap],
  )

  const filteredTransactions = useMemo(
    () =>
      selectedCategoryId != null
        ? monthWithCategory.filter((tx) => tx.categoryId === selectedCategoryId)
        : monthWithCategory,
    [monthWithCategory, selectedCategoryId],
  )

  // Money totals exclude notes (isNote), matching budget calculations
  const monthTotal = useMemo(() => sumSpent(monthWithCategory), [monthWithCategory])

  const filteredTotal = useMemo(() => sumSpent(filteredTransactions), [filteredTransactions])

  // The selected category object
  const selectedCategory = useMemo(
    () => (selectedCategoryId != null ? catMap.get(selectedCategoryId) : null),
    [selectedCategoryId, catMap],
  )

  // Categories that actually have transactions this month (for filter chips).
  // The selected category stays in the list even with zero transactions, so
  // the active filter is always visible and dismissable when browsing months.
  const activeCategories = useMemo(() => {
    const catIds = new Set((monthTransactions ?? []).map((t) => t.categoryId))
    const active = categories.filter((c) => c.id != null && catIds.has(c.id!))
    if (selectedCategory && !active.some((c) => c.id === selectedCategory.id)) {
      return [selectedCategory, ...active]
    }
    return active
  }, [monthTransactions, categories, selectedCategory])

  // Month label for display
  const monthLabel = useMemo(() => {
    const [y] = selectedMonth.split('-')
    return `${getMonthLabel(selectedMonth)} ${y}`
  }, [selectedMonth])

  return {
    selectedMonth,
    setSelectedMonth,
    monthKeys,
    monthLabel,
    monthTotal,
    categories,
    activeCategories,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedCategory,
    filteredTransactions,
    filteredTotal,
    catMap,
    isLoading: monthTransactions === undefined,
  }
}
