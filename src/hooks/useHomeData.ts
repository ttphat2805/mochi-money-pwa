import { useMemo, useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { toast } from 'sonner'
import { db } from '@/lib/db'
import { getMonthlyBudget, getRemainingBudget, getDailyAllowance, getSpentPct } from '@/lib/budget'
import { getTodayString, getCurrentMonthString, getDaysLeftInMonth, formatVND } from '@/lib/utils'
import type { RecurringTemplate, Transaction, FinancialSettings, BudgetCategory } from '@/types'

// ── Types ──────────────────────────────────────────────────────

export interface RecurringItem {
  template: RecurringTemplate
  category: BudgetCategory | undefined
  isDone: boolean
  transactionId?: number
}

export interface HomeData {
  isLoading: boolean

  // Financials
  todaySpent: number
  yesterdaySpent: number
  monthSpent: number
  settings: FinancialSettings | null
  remainingBudget: number | null
  dailyAllowance: number | null
  spentPct: number | null           // 0–1, for progress bar
  daysLeft: number
  lastMonthTotal: number

  // Content
  categoryWarnings: { category: BudgetCategory; spent: number; pct: number }[]
  recurringItems: RecurringItem[]
  recentTransactions: (Transaction & { category: BudgetCategory | undefined })[]

  // Actions
  toggleRecurring: (item: RecurringItem) => Promise<void>
  hasAnyRecurring: boolean
}

// ── Helpers ────────────────────────────────────────────────────

function matchesSchedule(schedule: RecurringTemplate['schedule']): boolean {
  const dow = new Date().getDay() // 0=Sun
  if (schedule === 'daily') return true
  if (schedule === 'weekdays') return dow >= 1 && dow <= 5
  if (Array.isArray(schedule)) return schedule.includes(dow)
  return false
}

const EMPTY_TXS: HomeData['recentTransactions'] = []
const EMPTY_CATS: BudgetCategory[] = []
const EMPTY_TEMPLATES: RecurringTemplate[] = []

// ── Hook ───────────────────────────────────────────────────────

export function useHomeData(): HomeData {
  const today = getTodayString()
  const monthKey = getCurrentMonthString()

  // ── Live queries (auto re-render on DB change) ──
  // Raw results are `undefined` until the first query resolves; keep them
  // raw so isLoading is accurate, and default only afterwards.

  const categoriesRaw = useLiveQuery(() => db.categories.toArray(), [])

  const todayTxsRaw = useLiveQuery(
    () => db.transactions.where('date').equals(today).filter((tx) => !tx.deletedAt).toArray(),
    [today],
  )

  const todaySpentRaw = useLiveQuery(async () => {
    const txs = await db.transactions
      .where('date').equals(today)
      .filter((tx) => !tx.deletedAt && !tx.isNote)
      .toArray()
    return txs.reduce((sum, tx) => sum + tx.amount, 0)
  }, [today])

  const yesterdayString = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }, [])

  const yesterdaySpentRaw = useLiveQuery(async () => {
    const txs = await db.transactions
      .where('date').equals(yesterdayString)
      .filter((tx) => !tx.deletedAt && !tx.isNote)
      .toArray()
    return txs.reduce((sum, tx) => sum + tx.amount, 0)
  }, [yesterdayString])

  const monthTxsRaw = useLiveQuery(
    () =>
      db.transactions
        .where('date')
        .between(monthKey + '-01', monthKey + '-31', true, true)
        .filter((tx) => !tx.deletedAt && !tx.isNote)
        .toArray(),
    [monthKey],
  )

  const activeTemplatesRaw = useLiveQuery(
    () => db.recurringTemplates.filter((t) => t.active).toArray(),
    [],
  )

  // `?? null` inside the query: "no settings row" resolves to null, so
  // undefined unambiguously means "still loading"
  // This month's extra incomes — part of the budget (same formula as Budget tab)
  const extraIncomeRaw = useLiveQuery(
    async () => {
      const rows = await db.extraIncomes.where('monthKey').equals(monthKey).toArray()
      return rows.reduce((sum, e) => sum + e.amount, 0)
    },
    [monthKey],
  )

  const settingsRaw = useLiveQuery(
    async () => (await db.settings.toCollection().first()) ?? null,
    [],
  )

  const lastMonthKey = useMemo(() => {
    const [y, m] = monthKey.split('-').map(Number)
    const prevM = m === 1 ? 12 : m - 1
    const prevY = m === 1 ? y - 1 : y
    return `${prevY}-${String(prevM).padStart(2, '0')}`
  }, [monthKey])

  const lastMonthTotalRaw = useLiveQuery(
    async () => {
      const txs = await db.transactions
        .where('date')
        .between(lastMonthKey + '-01', lastMonthKey + '-31', true, true)
        .filter((tx) => !tx.deletedAt && !tx.isNote)
        .toArray()
      return txs.reduce((sum, tx) => sum + tx.amount, 0)
    },
    [lastMonthKey],
  )

  // Wider window than the 8 rows shown by default, so the category filter
  // on the Home recent list has data to work with without extra queries.
  const recentQuery = useLiveQuery(
    () =>
      db.transactions
        .orderBy('id')
        .reverse()
        .filter((tx) => !tx.deletedAt)
        .limit(50)
        .toArray(),
    [],
  )

  const isLoading =
    categoriesRaw === undefined ||
    todayTxsRaw === undefined ||
    todaySpentRaw === undefined ||
    yesterdaySpentRaw === undefined ||
    monthTxsRaw === undefined ||
    activeTemplatesRaw === undefined ||
    settingsRaw === undefined ||
    extraIncomeRaw === undefined ||
    lastMonthTotalRaw === undefined ||
    recentQuery === undefined

  const categories = categoriesRaw ?? EMPTY_CATS
  const todayTxs = todayTxsRaw ?? EMPTY_TXS
  const todaySpent = todaySpentRaw ?? 0
  const yesterdaySpent = yesterdaySpentRaw ?? 0
  const monthTxs = monthTxsRaw ?? EMPTY_TXS
  const activeTemplates = activeTemplatesRaw ?? EMPTY_TEMPLATES
  const settings = settingsRaw ?? null
  const extraIncome = extraIncomeRaw ?? 0
  const lastMonthTotal = lastMonthTotalRaw ?? 0
  const recentRaw = recentQuery ?? EMPTY_TXS

  // ── Derived values ──

  const catMap = useMemo(() => {
    const m = new Map<number, BudgetCategory>()
    for (const c of categories) {
      if (c.id != null) m.set(c.id, c)
    }
    return m
  }, [categories])

  const monthSpent = useMemo(
    () => monthTxs.reduce((sum, tx) => sum + tx.amount, 0),
    [monthTxs],
  )

  const { remainingBudget, dailyAllowance, spentPct } = useMemo(() => {
    if (!settings?.income) return { remainingBudget: null, dailyAllowance: null, spentPct: null }
    // Shared formula (lib/budget.ts) so Home matches the Budget & Overview tabs
    const budget = getMonthlyBudget({
      income: settings.income,
      extraIncome,
      savingTarget: settings.savingTarget ?? 0,
    })
    const remaining = getRemainingBudget(budget, monthSpent)
    // Hero shows 0/day plus the over-budget state when nothing is left
    const daily = getDailyAllowance(remaining, getDaysLeftInMonth()) ?? 0
    const pct = Math.min(1, getSpentPct(monthSpent, budget) / 100)
    return { remainingBudget: remaining, dailyAllowance: daily, spentPct: pct }
  }, [settings, extraIncome, monthSpent])

  const todayRecurringMap = useMemo(() => {
    const m = new Map<number, number>()
    for (const tx of todayTxs) {
      if (tx.type === 'recurring' && tx.recurringId != null && tx.id != null) {
        m.set(tx.recurringId, tx.id)
      }
    }
    return m
  }, [todayTxs])

  const recurringItems = useMemo<RecurringItem[]>(() => {
    return activeTemplates
      .filter((t) => matchesSchedule(t.schedule))
      .map((t) => ({
        template: t,
        category: t.categoryId ? catMap.get(t.categoryId) : undefined,
        isDone: t.id != null ? todayRecurringMap.has(t.id) : false,
        transactionId: t.id != null ? todayRecurringMap.get(t.id) : undefined,
      }))
  }, [activeTemplates, catMap, todayRecurringMap])

  const recentTransactions = useMemo<HomeData['recentTransactions']>(
    () => recentRaw.map((tx) => ({ ...tx, category: catMap.get(tx.categoryId) })),
    [recentRaw, catMap],
  )

  const categoryWarnings = useMemo(() => {
    const spentByCat = new Map<number, number>()
    for (const tx of monthTxs) {
      if (tx.categoryId != null) {
        spentByCat.set(tx.categoryId, (spentByCat.get(tx.categoryId) || 0) + tx.amount)
      }
    }
    const warnings: { category: BudgetCategory; spent: number; pct: number }[] = []
    for (const cat of categories) {
      if (cat.limitPerMonth && cat.id != null) {
        const spent = spentByCat.get(cat.id) || 0
        const pct = spent / cat.limitPerMonth
        if (pct >= 0.8) {
          warnings.push({ category: cat, spent, pct })
        }
      }
    }
    return warnings.sort((a, b) => b.pct - a.pct).slice(0, 3)
  }, [categories, monthTxs])

  const toggleRecurring = useCallback(async (item: RecurringItem) => {
    const { template, isDone, transactionId } = item
    if (isDone) {
      if (transactionId != null) {
        await db.transactions.update(transactionId, { deletedAt: new Date().toISOString() })
        toast.success(`Đã hoàn ${formatVND(template.amount)}đ · ${item.category?.name ?? ''}`)
      }
      return
    }
    await db.transactions.add({
      amount: template.amount,
      categoryId: template.categoryId,
      date: today,
      type: 'recurring',
      recurringId: template.id,
      createdAt: new Date().toISOString(),
      deletedAt: null,
    })
    navigator.vibrate?.(10)
    toast.success(`Đã ghi −${formatVND(template.amount)}đ · ${item.category?.name ?? ''}`)
  }, [today])

  return {
    isLoading,
    todaySpent,
    yesterdaySpent,
    monthSpent,
    settings,
    remainingBudget,
    dailyAllowance,
    spentPct,
    daysLeft: getDaysLeftInMonth(),
    lastMonthTotal,
    categoryWarnings,
    recurringItems,
    recentTransactions,
    toggleRecurring,
    hasAnyRecurring: activeTemplates.length > 0,
  }
}
