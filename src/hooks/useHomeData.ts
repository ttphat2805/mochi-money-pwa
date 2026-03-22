import { useMemo, useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { toast } from 'sonner'
import { db } from '@/lib/db'
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
}

// ── Helpers ────────────────────────────────────────────────────

function matchesSchedule(schedule: RecurringTemplate['schedule']): boolean {
  const dow = new Date().getDay() // 0=Sun
  if (schedule === 'daily') return true
  if (schedule === 'weekdays') return dow >= 1 && dow <= 5
  if (Array.isArray(schedule)) return schedule.includes(dow)
  return false
}

const EMPTY: RecurringItem[] = []
const EMPTY_TXS: HomeData['recentTransactions'] = []

// ── Hook ───────────────────────────────────────────────────────

export function useHomeData(): HomeData {
  const today = getTodayString()
  const monthKey = getCurrentMonthString()

  // ── Live queries (auto re-render on DB change) ──

  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? []

  const todayTxs = useLiveQuery(
    () => db.transactions.where('date').equals(today).filter((tx) => !tx.deletedAt).toArray(),
    [today],
  ) ?? []

  const todaySpent = useLiveQuery(async () => {
    const txs = await db.transactions
      .where('date').equals(today)
      .filter((tx) => !tx.deletedAt)
      .toArray()
    return txs.reduce((sum, tx) => sum + tx.amount, 0)
  }, [today]) ?? 0

  const yesterdayString = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }, [])

  const yesterdaySpent = useLiveQuery(async () => {
    const txs = await db.transactions
      .where('date').equals(yesterdayString)
      .filter((tx) => !tx.deletedAt)
      .toArray()
    return txs.reduce((sum, tx) => sum + tx.amount, 0)
  }, [yesterdayString]) ?? 0

  const monthTxs = useLiveQuery(
    () =>
      db.transactions
        .where('date')
        .between(monthKey + '-01', monthKey + '-31', true, true)
        .filter((tx) => !tx.deletedAt)
        .toArray(),
    [monthKey],
  ) ?? []

  const activeTemplates = useLiveQuery(
    () => db.recurringTemplates.filter((t) => t.active).toArray(),
    [],
  ) ?? []

  const settings = useLiveQuery(
    () => db.settings.toCollection().first(),
    [],
  ) ?? null

  const lastMonthKey = useMemo(() => {
    const [y, m] = monthKey.split('-').map(Number)
    const prevM = m === 1 ? 12 : m - 1
    const prevY = m === 1 ? y - 1 : y
    return `${prevY}-${String(prevM).padStart(2, '0')}`
  }, [monthKey])

  const lastMonthTotal = useLiveQuery(
    async () => {
      const txs = await db.transactions
        .where('date')
        .between(lastMonthKey + '-01', lastMonthKey + '-31', true, true)
        .filter((tx) => !tx.deletedAt)
        .toArray()
      return txs.reduce((sum, tx) => sum + tx.amount, 0)
    },
    [lastMonthKey],
  ) ?? 0

  const recentRaw = useLiveQuery(
    () =>
      db.transactions
        .orderBy('id')
        .reverse()
        .filter((tx) => !tx.deletedAt)
        .limit(5)
        .toArray(),
    [],
  ) ?? []

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
    const savingTarget = settings.savingTarget ?? 0
    const flexAmount = settings.income - savingTarget
    const remaining = flexAmount - monthSpent
    const daysLeft = getDaysLeftInMonth()
    const daily = Math.max(0, remaining / daysLeft)
    const pct = flexAmount > 0 ? Math.min(1, monthSpent / flexAmount) : 0
    return { remainingBudget: remaining, dailyAllowance: daily, spentPct: pct }
  }, [settings, monthSpent])

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

  const isLoading = categories == null || todayTxs == null || monthTxs == null

  return {
    isLoading,
    todaySpent,
    yesterdaySpent,
    monthSpent,
    settings: settings as FinancialSettings | null,
    remainingBudget,
    dailyAllowance,
    spentPct,
    daysLeft: getDaysLeftInMonth(),
    lastMonthTotal,
    categoryWarnings,
    recurringItems: recurringItems ?? EMPTY,
    recentTransactions: recentTransactions ?? EMPTY_TXS,
    toggleRecurring,
  }
}
