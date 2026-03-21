/* ───────────────────────────────────────────
   Core domain types — matches Dexie schema
   ─────────────────────────────────────────── */

/** Financial settings — opt-in, stored as single row */
export interface FinancialSettings {
  id?: number
  /** Monthly income in VND, undefined = not set */
  income?: number
  /** Saving target in VND (absolute, not %), undefined = not set */
  savingTarget?: number
  updatedAt: string // ISO date string
}

/** One-off extra income for a specific month */
export interface ExtraIncome {
  id?: number
  name: string
  amount: number
  monthKey: string   // 'YYYY-MM'
  note?: string
  createdAt: string
}

/** Budget status for a category */
export type BudgetStatus = 'ok' | 'warning' | 'danger' | 'over'

export function getBudgetStatus(spent: number, limit: number | null): BudgetStatus {
  if (!limit) return 'ok'
  const pct = spent / limit
  if (pct >= 1.0) return 'over'
  if (pct >= 0.8) return 'danger'
  if (pct >= 0.6) return 'warning'
  return 'ok'
}

export const BUDGET_STATUS_COLORS: Record<BudgetStatus, string> = {
  ok:      '#2A9D6E',
  warning: '#D97706',
  danger:  '#E8A020',
  over:    '#D63E3E',
}

/** Fixed monthly expense (rent, bills, etc.) */
export interface FixedExpense {
  id?: number
  name: string
  /** Amount in VND */
  amount: number
  /** Day of month (1–31). Clamped to last day for short months. */
  payDay: number
  icon: string
  note: string
  active: boolean
  /** Optional link to a BudgetCategory */
  categoryId?: number
}

/** Spending category with optional monthly limit */
export interface BudgetCategory {
  id?: number
  name: string
  /** Emoji icon */
  icon: string
  /** Auto-assigned, not user-selectable */
  color: string
  /** Monthly limit in VND, null = unlimited */
  limitPerMonth: number | null
  /** Drag-to-reorder position */
  sortOrder: number
}

/** Recurring transaction template */
export interface RecurringTemplate {
  id?: number
  name: string
  /** Amount in VND */
  amount: number
  categoryId: number
  /** 'daily' | 'weekdays' | number[] (0=Sun,1=Mon,...) */
  schedule: RecurringSchedule
  active: boolean
}

/** Schedule type for recurring templates */
export type RecurringSchedule = 'daily' | 'weekdays' | number[]

/** Payment method options */
export type PaymentMethod = 'cash' | 'transfer' | 'momo' | 'card'

/** Transaction type discriminator */
export type TransactionType = 'recurring' | 'manual' | 'fixed'

/** Core transaction record */
export interface Transaction {
  id?: number
  /** Amount in VND — always stored as raw number */
  amount: number
  categoryId: number
  /** Date as 'YYYY-MM-DD' string — NEVER a Date object or timestamp */
  date: string
  /** Optional user note */
  note?: string
  type: TransactionType
  /** Link to RecurringTemplate if type === 'recurring' */
  recurringId?: number
  /** Optional payment method tag */
  paymentMethod?: PaymentMethod
  /** ISO timestamp of creation */
  createdAt: string
  /** Soft delete marker — non-null means deleted. Hard delete after 5s undo window. */
  deletedAt?: string | null
}

/* ───────────────────────────────────────────
   Default category colors — auto-assigned
   ─────────────────────────────────────────── */

export const CATEGORY_COLORS = [
  '#E8A020', // amber
  '#D63E3E', // red
  '#2A9D6E', // green
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#F59E0B', // yellow
  '#06B6D4', // cyan
  '#10B981', // emerald
  '#6366F1', // indigo
] as const

/* ───────────────────────────────────────────
   Default seed categories
   ─────────────────────────────────────────── */

export interface SeedCategory {
  icon: string
  name: string
}

export const DEFAULT_CATEGORIES: SeedCategory[] = [
  { icon: '🍜', name: 'Ăn uống' },
  { icon: '☕', name: 'Cafe & Trà sữa' },
  { icon: '🍺', name: 'Nhậu' },
  { icon: '⛽', name: 'Xăng xe' },
  { icon: '🅿️', name: 'Gửi xe' },
  { icon: '🛒', name: 'Mua sắm' },
  { icon: '🏠', name: 'Nhà & Điện nước' },
  { icon: '💊', name: 'Sức khỏe' },
  { icon: '🎮', name: 'Giải trí' },
  { icon: '📦', name: 'Khác' },
] as const
