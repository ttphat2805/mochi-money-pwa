import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { getCurrentMonthString, getDaysLeftInMonth, getDaysInMonth, getTodayString } from '@/lib/utils'
import type { BudgetCategory } from '@/types'
import { toast } from 'sonner'

export interface CategoryBudgetItem extends BudgetCategory {
  spent: number
  pct: number         // 0–100 clamped
  remaining: number   // can be negative (over budget)
  status: 'ok' | 'warning' | 'danger' | 'over'
}

export function useBudget() {
  const monthKey = getCurrentMonthString()
  const todayStr = getTodayString()
  const [yr, mo] = todayStr.split('-').map(Number)
  const daysInMonth = getDaysInMonth(yr, mo)
  const daysLeft = getDaysLeftInMonth()

  // ── Financial settings ────────────────────────────────────────
  const settings = useLiveQuery(() => db.settings.toCollection().first(), []) ?? null

  // ── This month's total spent ──────────────────────────────────
  const totalSpent = useLiveQuery(async () => {
    const txs = await db.transactions
      .where('date')
      .startsWith(monthKey)
      .filter((tx) => !tx.deletedAt)
      .toArray()
    return txs.reduce((s, t) => s + t.amount, 0)
  }, [monthKey]) ?? 0

  // ── Budget math ───────────────────────────────────────────────
  const { flexAmount, spentPct, dailyAllowance } = useMemo(() => {
    const income = settings?.income ?? 0
    const saving = settings?.savingTarget ?? 0
    // We no longer pre-subtract fixed expenses from the flex budget
    // to avoid double counting when the user adds them as transactions.
    const flex = Math.max(0, income - saving)
    const pct = flex > 0 ? Math.min(100, Math.round((totalSpent / flex) * 100)) : 0
    const remaining = flex - totalSpent
    const daily = daysLeft > 0 ? Math.max(0, remaining / daysLeft) : 0
    return { flexAmount: flex, spentPct: pct, dailyAllowance: daily }
  }, [settings, totalSpent, daysLeft])

  const isConfigured = Boolean(settings?.income)

  // ── Per-category budget data ───────────────────────────────────
  const categoriesWithBudget = useLiveQuery(async () => {
    const cats = await db.categories.orderBy('sortOrder').toArray()
    const results: CategoryBudgetItem[] = []

    for (const cat of cats) {
      if (cat.id == null) continue
      const txs = await db.transactions
        .where('date')
        .startsWith(monthKey)
        .filter((tx) => !tx.deletedAt && tx.categoryId === cat.id)
        .toArray()
      const spent = txs.reduce((s, t) => s + t.amount, 0)
      const limit = cat.limitPerMonth
      const pct = limit && limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0
      const remaining = limit ? limit - spent : 0

      let status: CategoryBudgetItem['status'] = 'ok'
      if (limit) {
        const ratio = spent / limit
        if (ratio > 1) status = 'over'
        else if (ratio >= 0.8) status = 'danger'
        else if (ratio >= 0.6) status = 'warning'
      }

      results.push({ ...cat, spent, pct, remaining, status })
    }
    return results
  }, [monthKey]) ?? []

  // ── Inline limit setter state ─────────────────────────────────
  const [settingLimitFor, setSettingLimitFor] = useState<number | null>(null)
  const [limitInput, setLimitInput] = useState('')

  const limitAmount = useMemo(() => {
    const digits = limitInput.replace(/\D/g, '')
    return parseInt(digits || '0', 10)
  }, [limitInput])

  const openSetLimit = (cat: BudgetCategory) => {
    setSettingLimitFor(cat.id!)
    const existing = cat.limitPerMonth
    setLimitInput(existing ? new Intl.NumberFormat('vi-VN').format(existing) : '')
  }

  const saveLimit = async (catId: number, amount: number) => {
    if (amount <= 0) {
      toast.error('Hạn mức phải lớn hơn 0')
      return
    }
    await db.categories.update(catId, { limitPerMonth: amount })
    toast.success(`Đã đặt giới hạn ${new Intl.NumberFormat('vi-VN').format(amount)}đ`)
    setSettingLimitFor(null)
    setLimitInput('')
  }

  const handleLimitInputChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '')
    const num = parseInt(digits || '0', 10)
    setLimitInput(num > 0 ? new Intl.NumberFormat('vi-VN').format(num) : '')
  }

  return {
    isConfigured,
    totalSpent,
    flexAmount,
    spentPct,
    daysLeft,
    daysInMonth,
    dailyAllowance,
    categoriesWithBudget,
    settingLimitFor,
    setSettingLimitFor,
    limitInput,
    limitAmount,
    openSetLimit,
    saveLimit,
    handleLimitInputChange,
    monthKey,
  }
}
