// ── Monthly budget math — single source of truth ──────────────────
//
// Definition (used by Budget tab, Overview stat cards, money-flow card and
// the Financial settings preview):
//
//   budget    = income + extra income this month − saving goal   (≥ 0)
//   spent     = sumSpent(month transactions)                     (no notes, no deleted)
//   remaining = budget − spent                                   (can be negative)
//   per-day   = remaining / days left incl. today                (only when remaining > 0)
//
// Fixed expenses are NOT subtracted from the budget: on their pay day they
// are posted as real transactions (see checkAndCreateFixedTransactions), so
// they are already counted in `spent`. Subtracting them up-front as well
// would double count them.

/** Minimum elapsed days before a month-end spending forecast is shown. */
export const FORECAST_MIN_DAYS = 5

export interface BudgetInput {
  /** Monthly base income (settings.income), 0 / undefined = not set */
  income?: number | null
  /** Sum of this month's extra incomes */
  extraIncome?: number
  /** Monthly saving goal (settings.savingTarget) */
  savingTarget?: number | null
}

/**
 * Money available to spend this month:
 * income + extra income − saving goal, never below 0.
 */
export function getMonthlyBudget({ income, extraIncome = 0, savingTarget }: BudgetInput): number {
  return Math.max(0, (income ?? 0) + extraIncome - (savingTarget ?? 0))
}

/** Budget left this month. Negative means over budget. */
export function getRemainingBudget(budget: number, spent: number): number {
  return budget - spent
}

/**
 * Amount that can still be spent per day (today included), or `null` when
 * the budget is already used up — callers should show "Đã vượt" / 0 instead
 * of a negative per-day number.
 */
export function getDailyAllowance(remaining: number, daysLeft: number): number | null {
  if (remaining <= 0) return null
  return remaining / Math.max(1, daysLeft)
}

/** Spent as a percentage of the budget (unclamped; 0 when no budget). */
export function getSpentPct(spent: number, budget: number): number {
  return budget > 0 ? (spent / budget) * 100 : 0
}

export interface SpendingForecast {
  /** Average spend per elapsed day */
  dailyAverage: number
  /** Projected month-end total at the current pace */
  projectedTotal: number
  /** projectedTotal − budget (positive = projected overspend); null without budget */
  vsBudget: number | null
}

/**
 * Linear month-end forecast from month-to-date spending.
 * Returns `null` until {@link FORECAST_MIN_DAYS} days have elapsed — earlier
 * projections (e.g. day 1 × 30) are too noisy to be useful.
 */
export function getSpendingForecast(
  spent: number,
  dayOfMonth: number,
  daysInMonth: number,
  budget: number,
): SpendingForecast | null {
  if (dayOfMonth < FORECAST_MIN_DAYS) return null
  const dailyAverage = spent / dayOfMonth
  const projectedTotal = dailyAverage * daysInMonth
  return {
    dailyAverage,
    projectedTotal,
    vsBudget: budget > 0 ? projectedTotal - budget : null,
  }
}

/**
 * Planning average for the whole month (budget / days in month), used by the
 * settings preview before any spending. The live, spending-aware figure is
 * {@link getDailyAllowance}.
 */
export function getPlannedDailyBudget(budget: number, daysInMonth: number): number {
  return daysInMonth > 0 ? Math.floor(budget / daysInMonth) : 0
}
