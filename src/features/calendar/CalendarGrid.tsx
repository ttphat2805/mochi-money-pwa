import { formatShort } from '@/lib/utils'
import type { CalendarDayCell } from '@/hooks/useCalendar'
import { getHeatLevel, HEAT_BG, HEAT_TEXT } from '@/hooks/useCalendar'

const WEEKDAY_HEADERS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

interface CalendarGridProps {
  days: CalendarDayCell[]
  dailyTotals: Record<string, number>
  maxDailyAmount: number
  selectedDay: string | null
  onSelectDay: (date: string) => void
  onSwipeLeft: () => void
  onSwipeRight: () => void
}

export function CalendarGrid({
  days,
  dailyTotals,
  maxDailyAmount,
  selectedDay,
  onSelectDay,
  onSwipeLeft,
  onSwipeRight,
}: CalendarGridProps) {
  let touchStartX = 0

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      diff > 0 ? onSwipeLeft() : onSwipeRight()
    }
  }

  return (
    <div
      className="px-3"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7">
        {WEEKDAY_HEADERS.map((h, i) => (
          <div
            key={h}
            className={`text-center text-[10px] font-medium uppercase tracking-wide ${
              i >= 5 ? 'text-accent' : 'text-text-hint'
            }`}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((cell) => {
          if (cell.type === 'empty') return <div key={cell.key} />

          const { date, day, isToday, isFuture } = cell
          const amount = dailyTotals[date] ?? 0
          const heat = getHeatLevel(amount, maxDailyAmount)
          const isSelected = date === selectedDay

          return (
            <button
              key={date}
              type="button"
              disabled={isFuture}
              onClick={() => onSelectDay(date)}
              className="flex flex-col items-center justify-between overflow-hidden rounded-lg py-1 transition-transform"
              style={{
                minHeight: 52,
                backgroundColor: HEAT_BG[heat],
                border: isSelected
                  ? '1.5px solid #E8A020'
                  : isToday
                    ? '1.5px solid #F5C043'
                    : '1.5px solid transparent',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isSelected ? '0 2px 8px rgba(232,160,32,0.3)' : 'none',
                opacity: isFuture ? 0.35 : 1,
              }}
            >
              <span
                className="text-[12px] font-medium leading-none"
                style={{ color: amount > 0 ? HEAT_TEXT[heat] : 'var(--color-text-muted)' }}
              >
                {day}
              </span>
              {amount > 0 && (
                <span
                  className="font-num mt-0.5 text-[9px] leading-none"
                  style={{ color: HEAT_TEXT[heat] }}
                >
                  {formatShort(amount)}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
