import React, { useRef } from 'react'
import { formatShort } from '@/lib/utils'
import type { CalendarDayCell } from '@/hooks/useCalendar'
import { getHeatLevel, HEAT_BG, HEAT_TEXT } from '@/hooks/useCalendar'
import { motion } from 'framer-motion'

const WEEKDAY_HEADERS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

interface CalendarGridProps {
  days: CalendarDayCell[]
  dailyTotals: Record<string, number>
  maxDailyAmount: number
  selectedDay: string | null
  onSelectDay: (date: string) => void
  onSwipeLeft: () => void
  onSwipeRight: () => void
  monthKey: string
  slideDir: 'left' | 'right' | null
}

// Optimized day cell with high-end motion
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
  const { date, day, isToday } = cell

  return (
    <button
      type="button"
      onClick={() => onSelect(date)}
      className="relative flex flex-col items-center justify-center gap-1 w-full min-h-[58px] transition-all duration-200 rounded-xl overflow-hidden"
      style={{
        backgroundColor: isSelected ? 'var(--color-accent)' : HEAT_BG[heat],
        border: isToday && !isSelected ? '1.5px solid var(--color-accent)' : '1.5px solid transparent',
        boxShadow: isSelected ? '0 4px 12px var(--color-accent-h2)' : 'none',
        zIndex: isSelected ? 10 : 1,
      }}
    >
      {/* Selection highlight overlay is removed in favor of simple background transition */}

      <span
        className="text-[14px] leading-none z-10"
        style={{
          fontWeight: isToday || isSelected ? 800 : 600,
          color: isSelected
            ? '#FFFFFF'
            : isToday
              ? 'var(--color-accent-dark)'
              : amount > 0
                ? HEAT_TEXT[heat]
                : 'var(--color-text-muted)',
        }}
      >
        {day}
      </span>

      {amount > 0 && (
        <span
          className="font-num text-[10px] leading-none tracking-tight z-10 mt-0.5"
          style={{
            fontWeight: 700,
            color: isSelected ? 'rgba(255,255,255,0.9)' : HEAT_TEXT[heat],
          }}
        >
          {formatShort(amount)}
        </span>
      )}

      {/* Today dot indicator */}
      {isToday && !isSelected && (
        <div className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-accent-dark" />
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
      if (diff > 0) {
        onSwipeLeft()
      } else {
        onSwipeRight()
      }
    }
  }

  return (
    <div
      className="px-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Weekday headers */}
      <div className="mb-2 grid grid-cols-7">
        {WEEKDAY_HEADERS.map((h, i) => (
          <div
            key={h}
            className={`text-center text-[10px] font-black uppercase tracking-widest ${
              i >= 5 ? 'text-accent/70' : 'text-text-hint'
            }`}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Day cells with slide animation */}
      <motion.div
        key={monthKey}
        initial={slideDir ? { x: slideDir === 'left' ? 20 : -20, opacity: 0 } : false}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-7 gap-1"
      >
        {days.map((cell) => {
          if (cell.type === 'empty') return <div key={cell.key} className="min-h-[58px]" />

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
      </motion.div>
    </div>
  )
}
