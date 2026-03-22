import React, { useRef } from 'react'
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
  // key changes when month changes — triggers slide animation
  monthKey: string
  slideDir: 'left' | 'right' | null
}

// Memoized day cell for perf
const DayCell = React.memo(function DayCell({
  cell,
  isSelected,
  amount,
  heat,
  onSelect,
}: {
  cell: Extract<CalendarDayCell, { type: 'day' }>
  isSelected: boolean
  amount: number
  heat: 0 | 1 | 2 | 3 | 4
  onSelect: (date: string) => void
}) {
  const { date, day, isToday, isFuture } = cell

  return (
    <button
      type="button"
      disabled={isFuture}
      onClick={() => onSelect(date)}
      style={{
        minHeight: 52,
        backgroundColor: isSelected ? 'var(--color-accent)' : HEAT_BG[heat],
        border: isSelected
          ? '2px solid var(--color-accent)'
          : isToday
            ? '2px solid var(--color-accent)'
            : '2px solid transparent',
        transform: isSelected ? 'scale(1.06)' : 'scale(1)',
        boxShadow: isSelected ? '0 3px 10px var(--color-accent-h2)' : 'none',
        opacity: isFuture ? 0.35 : 1,
        transition: 'transform 150ms ease, background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease',
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        padding: '4px 2px',
        width: '100%',
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: isToday ? 700 : isSelected ? 700 : 500,
          lineHeight: 1,
          color: isSelected
            ? '#FFFFFF'
            : isToday
              ? 'var(--color-accent)'
              : amount > 0
                ? HEAT_TEXT[heat]
                : 'var(--color-text-muted)',
        }}
      >
        {day}
      </span>
      {amount > 0 && (
        <span
          style={{
            fontSize: 9,
            lineHeight: 1,
            fontWeight: 600,
            color: isSelected ? 'rgba(255,255,255,0.85)' : HEAT_TEXT[heat],
          }}
        >
          {formatShort(amount)}
        </span>
      )}
      {/* Today dot when not selected */}
      {isToday && !isSelected && (
        <div className="flex items-center gap-1.5">
          <span
            className="size-1.5 rounded-full"
            style={{ backgroundColor: 'var(--color-accent)' }}
          />
        </div>
      )}
    </button>
  )
})

export function CalendarGrid({
  days,
  dailyTotals,
  maxDailyAmount,
  selectedDay,
  onSelectDay,
  onSwipeLeft,
  onSwipeRight,
  monthKey,
  slideDir,
}: CalendarGridProps) {
  const touchStartX = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      diff > 0 ? onSwipeLeft() : onSwipeRight()
    }
  }

  // Slide animation on month change
  const slideStyle: React.CSSProperties = slideDir === 'left'
    ? { animation: 'slideInFromRight 250ms ease-out' }
    : slideDir === 'right'
      ? { animation: 'slideInFromLeft 250ms ease-out' }
      : {}

  return (
    <div
      className="px-3"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Weekday headers */}
      <div className="mb-1.5 grid grid-cols-7">
        {WEEKDAY_HEADERS.map((h, i) => (
          <div
            key={h}
            className={`text-center text-[10px] font-semibold uppercase tracking-wide ${
              i >= 5 ? 'text-accent' : 'text-text-hint'
            }`}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Day cells with slide animation */}
      <div
        key={monthKey}
        className="grid grid-cols-7 gap-0.5"
        style={slideStyle}
      >
        {days.map((cell) => {
          if (cell.type === 'empty') return <div key={cell.key} />

          const amount = dailyTotals[cell.date] ?? 0
          const heat = getHeatLevel(amount, maxDailyAmount)
          const isSelected = cell.date === selectedDay

          return (
            <DayCell
              key={cell.date}
              cell={cell}
              isSelected={isSelected}
              amount={amount}
              heat={heat}
              onSelect={onSelectDay}
            />
          )
        })}
      </div>

      {/* Keyframe definitions via inline style tag */}
      <style>{`
        @keyframes slideInFromRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInFromLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
