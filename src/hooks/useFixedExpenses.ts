import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { db } from '@/lib/db'
import { getTodayString, getCurrentMonthString } from '@/lib/utils'
import type { FixedExpense } from '@/types'
import { toast } from 'sonner'

// ── Auto-transaction logic ─────────────────────────────────────

/**
 * Idempotent: run on every app open.
 * Checks each active fixed expense and creates a transaction if
 * the payDay has arrived this month and none has been created yet.
 */
export async function checkAndCreateFixedTransactions(): Promise<void> {
  const today = getTodayString()
  const [yearStr, monthStr] = today.split('-')
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10)

  const fixedExpenses = await db.fixedExpenses
    .filter((e) => Boolean(e.active))
    .toArray()

  for (const expense of fixedExpenses) {
    if (expense.id == null) continue

    // Clamp payDay to last day of this month
    const daysInMonth = new Date(year, month, 0).getDate()
    const actualPayDay = Math.min(expense.payDay, daysInMonth)
    const payDayStr = `${yearStr}-${monthStr}-${String(actualPayDay).padStart(2, '0')}`

    // Only create if payDay has passed or is today
    if (payDayStr > today) continue

    // Check if a fixed transaction for this expense already exists this month
    const existing = await db.transactions
      .where('date')
      .startsWith(`${yearStr}-${monthStr}`)
      .filter(
        (tx) =>
          tx.type === 'fixed' &&
          tx.recurringId === expense.id &&
          !tx.deletedAt,
      )
      .first()

    if (existing) continue

    // Create the transaction
    await db.transactions.add({
      amount: expense.amount,
      categoryId: expense.categoryId ?? 0,
      date: payDayStr,
      note: expense.note || expense.name,
      type: 'fixed',
      recurringId: expense.id,
      createdAt: new Date().toISOString(),
      deletedAt: null,
    })
  }
}

// ── Hook ───────────────────────────────────────────────────────

export function useFixedExpenses() {
  const monthKey = getCurrentMonthString()

  const fixedExpenses = useLiveQuery(() => db.fixedExpenses.toArray(), []) ?? []

  const thisMonthFixedTxs = useLiveQuery(
    () =>
      db.transactions
        .where('date')
        .startsWith(monthKey)
        .filter((tx) => tx.type === 'fixed' && !tx.deletedAt)
        .toArray(),
    [monthKey],
  ) ?? []

  const activeExpenses = useMemo(
    () => fixedExpenses.filter((e) => e.active),
    [fixedExpenses],
  )

  const totalPerMonth = useMemo(
    () => activeExpenses.reduce((sum, e) => sum + e.amount, 0),
    [activeExpenses],
  )

  // ── CRUD ──

  const addFixedExpense = async (data: Omit<FixedExpense, 'id'>) => {
    const id = await db.fixedExpenses.add(data)
    toast.success(`Đã thêm · ${data.name}`)
    return id
  }

  const updateFixedExpense = async (id: number, data: Partial<FixedExpense>) => {
    await db.fixedExpenses.update(id, data)
    if (data.name) toast.success(`Đã lưu · ${data.name}`)
  }

  const deleteFixedExpense = async (id: number, name?: string) => {
    await db.fixedExpenses.delete(id)
    toast.success(`Đã xoá · ${name ?? ''}`)
  }

  const toggleActive = async (id: number, active: boolean) => {
    await db.fixedExpenses.update(id, { active })
  }

  return {
    fixedExpenses,
    activeExpenses,
    totalPerMonth,
    thisMonthFixedTxs,
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
    toggleActive,
    checkAndCreateTransactions: checkAndCreateFixedTransactions,
  }
}
