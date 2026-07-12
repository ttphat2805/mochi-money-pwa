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
  if (pct > 1.0) return 'over'
  if (pct >= 0.8) return 'danger'
  if (pct >= 0.6) return 'warning'
  return 'ok'
}

export const BUDGET_STATUS_COLORS: Record<BudgetStatus, string> = {
  ok:      '#10B981',
  warning: '#FBBF24',
  danger:  '#FB923C',
  over:    '#EF4444',
}

/** Fixed monthly expense (rent, bills, etc.) */
export interface FixedExpense {
  id?: number
  name: string
  /** Amount in VND */
  amount: number
  /** Day of month (1–31). Clamped to last day for short months. */
  payDay: number
  note: string
  active: boolean
  /** Link to a BudgetCategory, required for fixed expenses */
  categoryId: number
}

/** Spending category with optional monthly limit */
export interface BudgetCategory {
  id?: number
  name: string
  /** Icon name from lib/categoryIcons; legacy emoji values resolve via fallback */
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
  /**
   * When true, this transaction is saved to history but excluded from ALL
   * spending calculations: daily/monthly totals, budget progress, calendar
   * heatmap, and dashboard stats. Useful for one-off big purchases like
   * course fees, license fees, etc. that you want to track but not count.
   */
  isNote?: boolean
}

/* ───────────────────────────────────────────
   Default category colors — auto-assigned
   ─────────────────────────────────────────── */

export const CATEGORY_COLORS = [
  '#F59E0B', // amber
  '#F87171', // red
  '#34D399', // emerald
  '#60A5FA', // blue
  '#A78BFA', // violet
  '#F472B6', // pink
  '#FBBF24', // yellow
  '#22D3EE', // cyan
  '#4ADE80', // green
  '#818CF8', // indigo
] as const

/**
 * Old (light-theme) palette → new dark-theme palette.
 * Used by the DB migration to brighten colors already stored per category.
 */
export const LEGACY_CATEGORY_COLOR_MAP: Record<string, string> = {
  '#E8A020': '#F59E0B',
  '#D63E3E': '#F87171',
  '#2A9D6E': '#34D399',
  '#3B82F6': '#60A5FA',
  '#8B5CF6': '#A78BFA',
  '#EC4899': '#F472B6',
  '#F59E0B': '#FBBF24',
  '#06B6D4': '#22D3EE',
  '#10B981': '#4ADE80',
  '#6366F1': '#818CF8',
}

/* ───────────────────────────────────────────
   Default seed categories
   ─────────────────────────────────────────── */

export interface SeedCategory {
  /** Icon name from the category icon registry (lib/categoryIcons) */
  icon: string
  name: string
}

export const DEFAULT_CATEGORIES: SeedCategory[] = [
  { icon: 'utensils', name: 'Ăn uống' },
  { icon: 'coffee', name: 'Cafe & Trà sữa' },
  { icon: 'car-taxi-front', name: 'Di chuyển' },
  { icon: 'fuel', name: 'Xăng xe' },
  { icon: 'wrench', name: 'Sửa xe' },
  { icon: 'shopping-bag', name: 'Shopee' },
  { icon: 'shopping-cart', name: 'Mua sắm' },
  { icon: 'party-popper', name: 'Đám tiệc' },
  { icon: 'gift', name: 'Quà' },
  { icon: 'credit-card', name: 'Trả nợ' },
  { icon: 'house', name: 'Nhà & Điện nước' },
  { icon: 'pill', name: 'Sức khỏe' },
  { icon: 'gamepad-2', name: 'Giải trí' },
  { icon: 'beer', name: 'Nhậu' },
  { icon: 'package', name: 'Khác' },
] as const
