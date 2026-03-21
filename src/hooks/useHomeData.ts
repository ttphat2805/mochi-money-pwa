import { useMemo } from 'react'
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
  monthSpent: number
  settings: FinancialSettings | null
  remainingBudget: number | null
  dailyAllowance: number | null
  spentPct: number | null           // 0–1, for progress bar

  // Content
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

  const fixedExpenses = useLiveQuery(
    () => db.fixedExpenses.filter((e) => e.active).toArray(),
    [],
  ) ?? []

  const recentRaw = useLiveQuery(
    () =>
      db.transactions
        .orderBy('id') // 'id' is the primary key — always indexed, auto-increment = insertion order
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

  const todaySpent = useMemo(
    () => todayTxs.reduce((sum, tx) => sum + tx.amount, 0),
    [todayTxs],
  )

  const monthSpent = useMemo(
    () => monthTxs.reduce((sum, tx) => sum + tx.amount, 0),
    [monthTxs],
  )

  // Budget math (only when income is set)
  const { remainingBudget, dailyAllowance, spentPct } = useMemo(() => {
    if (!settings?.income) return { remainingBudget: null, dailyAllowance: null, spentPct: null }

    const totalFixed = fixedExpenses.reduce((s, e) => s + e.amount, 0)
    const savingTarget = settings.savingTarget ?? 0
    const flexAmount = settings.income - savingTarget - totalFixed
    const remaining = flexAmount - monthSpent
    const daysLeft = getDaysLeftInMonth()
    const daily = Math.max(0, remaining / daysLeft)
    const pct = flexAmount > 0 ? Math.min(1, monthSpent / flexAmount) : 0

    return {
      remainingBudget: remaining,
      dailyAllowance: daily,
      spentPct: pct,
    }
  }, [settings, fixedExpenses, monthSpent])

  // Today's recurring transactions keyed by recurringId
  const todayRecurringMap = useMemo(() => {
    const m = new Map<number, number>() // recurringId → transactionId
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

  // ── Actions ──

  const toggleRecurring = async (item: RecurringItem) => {
    const { template, isDone, transactionId } = item

    if (isDone) {
      // Untick → soft delete the transaction
      if (transactionId != null) {
        await db.transactions.update(transactionId, { deletedAt: new Date().toISOString() })
        const catName = item.category?.name ?? ''
        toast.success(`Đã hoàn ${formatVND(template.amount)}đ · ${catName}`)
      }
      return
    }

    // Tick → check budget limit, then create transaction
    const category = item.category
    if (category?.limitPerMonth != null && template.categoryId != null) {
      const spent = await db.transactions
        .where('date')
        .between(monthKey + '-01', monthKey + '-31', true, true)
        .filter(
          (tx) => !tx.deletedAt && tx.categoryId === template.categoryId,
        )
        .toArray()
        .then((txs) => txs.reduce((s, t) => s + t.amount, 0))

      if (spent + template.amount > category.limitPerMonth) {
        // Over budget — still allow (recurring is expected, just warn via toast)
        toast.warning(`Vượt hạn mức ${category.name} — vẫn đã ghi`)
      }
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

    // Haptic feedback
    navigator.vibrate?.(10)

    const catName = item.category?.name ?? ''
    toast.success(`Đã ghi −${formatVND(template.amount)}đ · ${catName}`)
  }

  const isLoading =
    categories == null ||
    todayTxs == null ||
    monthTxs == null

  return {
    isLoading,
    todaySpent,
    monthSpent,
    settings: settings as FinancialSettings | null,
    remainingBudget,
    dailyAllowance,
    spentPct,
    recurringItems: recurringItems ?? EMPTY,
    recentTransactions: recentTransactions ?? EMPTY_TXS,
    toggleRecurring,
  }
}
