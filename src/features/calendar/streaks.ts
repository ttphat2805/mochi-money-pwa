/**
 * Pure streak / no-spend computations for the calendar.
 * All dates are 'YYYY-MM-DD' strings (Asia/Ho_Chi_Minh), never Date objects.
 */

/** Shift a 'YYYY-MM-DD' string by n days (UTC math — no local TZ drift) */
export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number)
  const utc = new Date(Date.UTC(y, m - 1, d + n))
  return `${utc.getUTCFullYear()}-${String(utc.getUTCMonth() + 1).padStart(2, '0')}-${String(utc.getUTCDate()).padStart(2, '0')}`
}

/**
 * Consecutive days with at least one logged transaction, ending today —
 * or ending yesterday when nothing is logged yet today (the streak is
 * still alive until the day is over).
 */
export function computeLoggingStreak(loggedDates: ReadonlySet<string>, today: string): number {
  let cursor = loggedDates.has(today) ? today : addDays(today, -1)
  let streak = 0
  while (loggedDates.has(cursor)) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

/**
 * Past days of the shown month with zero (non-note) spending.
 * Only counts days on/after the first-ever transaction so brand-new users
 * don't see a month full of badges.
 */
export function getNoSpendDays(
  monthDates: readonly string[],
  dailyTotals: Readonly<Record<string, number>>,
  today: string,
  firstTxDate: string | null,
): Set<string> {
  const result = new Set<string>()
  if (!firstTxDate) return result
  for (const date of monthDates) {
    if (date >= today || date < firstTxDate) continue
    if ((dailyTotals[date] ?? 0) === 0) result.add(date)
  }
  return result
}
