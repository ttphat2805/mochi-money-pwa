import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import type { CalendarDayCell } from '@/hooks/useCalendar'
import { addDays, computeLoggingStreak, getNoSpendDays } from './streaks'

// Long enough for any realistic streak, small enough to stay cheap
const STREAK_LOOKBACK_DAYS = 400

export function useCalendarStreaks(
  days: CalendarDayCell[],
  dailyTotals: Record<string, number>,
  today: string,
) {
  // Distinct dates with any non-deleted transaction (notes count as logging)
  const loggedDates = useLiveQuery(
    async () => {
      const txs = await db.transactions
        .where('date')
        .aboveOrEqual(addDays(today, -STREAK_LOOKBACK_DAYS))
        .filter((tx) => !tx.deletedAt)
        .toArray()
      return new Set(txs.map((tx) => tx.date))
    },
    [today],
  )

  const firstTxDate = useLiveQuery(
    async () => {
      const first = await db.transactions
        .orderBy('date')
        .filter((tx) => !tx.deletedAt)
        .first()
      return first?.date ?? null
    },
    [],
  )

  const streak = useMemo(
    () => (loggedDates ? computeLoggingStreak(loggedDates, today) : 0),
    [loggedDates, today],
  )

  const noSpendDays = useMemo(() => {
    const monthDates = days.flatMap((c) => (c.type === 'day' ? [c.date] : []))
    return getNoSpendDays(monthDates, dailyTotals, today, firstTxDate ?? null)
  }, [days, dailyTotals, today, firstTxDate])

  return { streak, noSpendDays }
}
