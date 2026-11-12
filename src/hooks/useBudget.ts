import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { getCurrentMonthString, getDaysLeftInMonth, getDaysInMonth, getTodayString, sumSpent } from '@/lib/utils'
import { getDailyAllowance, getMonthlyBudget, getRemainingBudget, getSpentPct } from '@/lib/budget'
import { useCategoryStore } from '@/stores/categoryStore'
import type { BudgetCategory } from '@/types'
import { toast } from 'sonner'

function getPrevMonthKey(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number)
  if (m === 1) return `${y - 1}-12`
  return `${y}-${String(m - 1).padStart(2, '0')}`
}

export interface CategoryBudgetItem extends BudgetCategory {
  spent: number
  lastMonthSpent: number
  pct: number         // 0–100 clamped
  remaining: number   // can be negative (over budget)
  status: 'ok' | 'warning' | 'danger' | 'over'
}

export function useBudget() {
  const monthKey = getCurrentMonthString()
  const prevMonthKey = getPrevMonthKey(monthKey)
  const todayStr = getTodayString()
  const [yr, mo] = todayStr.split('-').map(Number)
  const daysInMonth = getDaysInMonth(yr, mo)
  const daysLeft = getDaysLeftInMonth()

  // ── Financial settings ────────────────────────────────────────
  // `?? null` inside the query so `undefined` only ever means "still loading"
  const settingsRaw = useLiveQuery(
    () => db.settings.toCollection().first().then((s) => s ?? null),
    [],
  )
  const settings = settingsRaw ?? null

  // ── This month's extra incomes ────────────────────────────────
  const extraIncomeRaw = useLiveQuery(
    async () => {
      const rows = await db.extraIncomes.where('monthKey').equals(monthKey).toArray()
      return rows.reduce((s, e) => s + e.amount, 0)
    },
    [monthKey],
  )
  const extraIncome = extraIncomeRaw ?? 0

  // ── This month's total spent ──────────────────────────────────
  const totalSpentRaw = useLiveQuery(async () => {
    const txs = await db.transactions
      .where('date')
      .startsWith(monthKey)
      .filter((tx) => !tx.deletedAt)
      .toArray()
    return sumSpent(txs)
  }, [monthKey])
  const totalSpent = totalSpentRaw ?? 0

  // ── Budget math (see lib/budget.ts) ───────────────────────────
  const { flexAmount, remaining, spentPct, dailyAllowance } = useMemo(() => {
    const budget = getMonthlyBudget({
      income: settings?.income,
      extraIncome,
      savingTarget: settings?.savingTarget,
    })
    const rem = getRemainingBudget(budget, totalSpent)
    return {
      flexAmount: budget,
      remaining: rem,
      spentPct: getSpentPct(totalSpent, budget),
      dailyAllowance: getDailyAllowance(rem, daysLeft),
    }
  }, [settings, extraIncome, totalSpent, daysLeft])

  const isConfigured = Boolean(settings?.income)

  // ── Per-category budget data ───────────────────────────────────
  const categoriesWithBudgetRaw = useLiveQuery(async () => {
    const cats = await db.categories.orderBy('sortOrder').toArray()
    const results: CategoryBudgetItem[] = []

    for (const cat of cats) {
      if (cat.id == null) continue
      
      const [currentTxs, prevTxs] = await Promise.all([
          db.transactions
            .where('date')
            .startsWith(monthKey)
            .filter((tx) => !tx.deletedAt && !tx.isNote && tx.categoryId === cat.id)
            .toArray(),
          db.transactions
            .where('date')
            .startsWith(prevMonthKey)
            .filter((tx) => !tx.deletedAt && !tx.isNote && tx.categoryId === cat.id)
            .toArray()
      ])

      const spent = currentTxs.reduce((s, t) => s + t.amount, 0)
      const lastMonthSpent = prevTxs.reduce((s, t) => s + t.amount, 0)
      
      const limit = cat.limitPerMonth
      const pct = limit && limit > 0 ? Math.round((spent / limit) * 100) : 0;
      const remaining = limit ? limit - spent : 0

      let status: CategoryBudgetItem['status'] = 'ok'
      if (limit) {
        const ratio = spent / limit
        if (ratio > 1) status = 'over'
        else if (ratio >= 0.8) status = 'danger'
        else if (ratio >= 0.6) status = 'warning'
      }

      results.push({ ...cat, spent, lastMonthSpent, pct, remaining, status })
    }
    return results
  }, [monthKey, prevMonthKey])

  const categoriesWithBudget = categoriesWithBudgetRaw ?? []

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

  // Writes go through the category store so its cached list (used by
  // Quick Add warnings, settings) stays in sync with the DB
  const updateCategory = useCategoryStore((s) => s.updateCategory)

  const saveLimit = async (catId: number, amount: number) => {
    if (amount <= 0) {
      toast.error('Hạn mức phải lớn hơn 0')
      return
    }
    await updateCategory(catId, { limitPerMonth: amount })
    toast.success(`Đã đặt giới hạn ${new Intl.NumberFormat('vi-VN').format(amount)}đ`)
    setSettingLimitFor(null)
    setLimitInput('')
  }

  const removeLimit = async (catId: number) => {
    await updateCategory(catId, { limitPerMonth: null })
    toast.success('Đã bỏ giới hạn')
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
    remaining,
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
    removeLimit,
    handleLimitInputChange,
    monthKey,
    isLoading:
      categoriesWithBudgetRaw === undefined ||
      settingsRaw === undefined ||
      extraIncomeRaw === undefined ||
      totalSpentRaw === undefined,
  }
}
