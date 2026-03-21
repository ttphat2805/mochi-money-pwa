import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { db } from '@/lib/db'
import { getCurrentMonthString, getDaysLeftInMonth, getDaysInMonth, getTodayString } from '@/lib/utils'
import type { ExtraIncome, FinancialSettings } from '@/types'
import { toast } from 'sonner'

export function useFinancialSettings() {
  const monthKey = getCurrentMonthString()

  const settings = useLiveQuery(() => db.settings.toCollection().first(), []) ?? null

  const fixedExpenses = useLiveQuery(
    () => db.fixedExpenses.filter((e) => Boolean(e.active)).toArray(),
    [],
  ) ?? []

  const extraIncomes = useLiveQuery(
    () => db.extraIncomes.where('monthKey').equals(monthKey).toArray(),
    [monthKey],
  ) ?? []

  const monthTxSpent = useLiveQuery(
    () =>
      db.transactions
        .where('date').startsWith(monthKey)
        .filter((tx) => !tx.deletedAt)
        .toArray()
        .then((txs) => txs.reduce((s, t) => s + t.amount, 0)),
    [monthKey],
  ) ?? 0

  // ── Derived ──────────────────────────────────────────────────

  const totalFixed = useMemo(
    () => fixedExpenses.reduce((s, e) => s + e.amount, 0),
    [fixedExpenses],
  )

  const extraTotal = useMemo(
    () => extraIncomes.reduce((s, e) => s + e.amount, 0),
    [extraIncomes],
  )

  const effectiveIncome = useMemo(
    () => (settings?.income ?? 0) + extraTotal,
    [settings, extraTotal],
  )

  const savingTarget = settings?.savingTarget ?? 0

  const flexAmount = useMemo(
    () => Math.max(0, effectiveIncome - savingTarget - totalFixed),
    [effectiveIncome, savingTarget, totalFixed],
  )

  const isConfigured = Boolean(settings?.income)

  /** Daily budget = flexAmount / days in current month */
  const todayStr = getTodayString()
  const [yr, mo] = todayStr.split('-').map(Number)
  const daysInMonth = getDaysInMonth(yr, mo)

  const dailyBudget = useMemo(
    () => (daysInMonth > 0 ? Math.max(0, flexAmount / daysInMonth) : 0),
    [flexAmount, daysInMonth],
  )

  const remainingBudget = useMemo(
    () => flexAmount - monthTxSpent,
    [flexAmount, monthTxSpent],
  )

  const dailyAllowance = useMemo(
    () => Math.max(0, remainingBudget / getDaysLeftInMonth()),
    [remainingBudget],
  )

  const isOverBudget = isConfigured && effectiveIncome < (savingTarget + totalFixed)

  // ── Actions ──────────────────────────────────────────────────

  const saveSettings = async (income: number, savingTarget: number) => {
    const existing = await db.settings.toCollection().first()
    if (existing?.id != null) {
      await db.settings.update(existing.id, { income, savingTarget, updatedAt: new Date().toISOString() })
    } else {
      await db.settings.add({ income, savingTarget, updatedAt: new Date().toISOString() })
    }
    toast.success('Đã lưu cài đặt tài chính')
  }

  const clearSettings = async () => {
    const existing = await db.settings.toCollection().first()
    if (existing?.id != null) {
      await db.settings.update(existing.id, { income: undefined, savingTarget: undefined, updatedAt: new Date().toISOString() })
    }
    toast.success('Đã xoá cài đặt tài chính')
  }

  const addExtraIncome = async (data: Omit<ExtraIncome, 'id' | 'createdAt'>) => {
    await db.extraIncomes.add({ ...data, createdAt: new Date().toISOString() })
    toast.success(`Đã thêm · ${data.name}`)
  }

  const deleteExtraIncome = async (id: number) => {
    await db.extraIncomes.delete(id)
  }

  return {
    settings: settings as FinancialSettings | null,
    extraIncomes,
    effectiveIncome,
    totalFixed,
    savingTarget,
    flexAmount,
    dailyBudget,
    dailyAllowance,
    remainingBudget,
    isConfigured,
    isOverBudget,
    daysInMonth,
    saveSettings,
    clearSettings,
    addExtraIncome,
    deleteExtraIncome,
  }
}
