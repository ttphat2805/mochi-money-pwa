import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { getCurrentMonthString, getMonthLabel } from '@/lib/utils'
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

  // Live query: transactions for selected month, optional category filter
  const filteredTransactions = useLiveQuery(async () => {
    const txs = await db.transactions
      .where('date')
      .startsWith(selectedMonth)
      .filter((tx) => !tx.deletedAt)
      .toArray()

    const filtered = selectedCategoryId
      ? txs.filter((tx) => tx.categoryId === selectedCategoryId)
      : txs

    return filtered
      .sort(
        (a, b) =>
          b.date.localeCompare(a.date) ||
          b.createdAt.localeCompare(a.createdAt),
      )
      .map((tx) => ({ ...tx, category: catMap.get(tx.categoryId) }))
  }, [selectedMonth, selectedCategoryId, catMap])

  // Month total (unfiltered, for header display)
  const monthTotal = useLiveQuery(async () => {
    const txs = await db.transactions
      .where('date')
      .startsWith(selectedMonth)
      .filter((tx) => !tx.deletedAt)
      .toArray()
    return txs.reduce((s, t) => s + t.amount, 0)
  }, [selectedMonth]) ?? 0

  // Filtered total (for the category summary header)
  const filteredTotal = useMemo(
    () => (filteredTransactions ?? []).reduce((s, t) => s + t.amount, 0),
    [filteredTransactions],
  )

  // The selected category object
  const selectedCategory = useMemo(
    () => (selectedCategoryId != null ? catMap.get(selectedCategoryId) : null),
    [selectedCategoryId, catMap],
  )

  // Categories that actually have transactions this month (for filter chips)
  const activeCategories = useLiveQuery(async () => {
    const txs = await db.transactions
      .where('date')
      .startsWith(selectedMonth)
      .filter((tx) => !tx.deletedAt)
      .toArray()

    const catIds = new Set(txs.map((t) => t.categoryId))
    return categories.filter((c) => c.id != null && catIds.has(c.id!))
  }, [selectedMonth, categories]) ?? []

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
    filteredTransactions: filteredTransactions ?? [],
    filteredTotal,
    catMap,
  }
}
