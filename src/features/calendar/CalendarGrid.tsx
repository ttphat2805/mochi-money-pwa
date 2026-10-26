import React, { useRef } from 'react'
import { formatShort } from '@/lib/utils'
import type { CalendarDayCell } from '@/hooks/useCalendar'
import { getHeatLevel } from '@/hooks/useCalendar'
import { triggerHaptic } from '@/lib/haptic'
import { motion } from 'framer-motion'

const WEEKDAY_HEADERS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

// Heatmap fills per level — CSS vars set by applyAccentColor (personalization)
const HEAT_BG = [
  'transparent',
  'var(--color-accent-h1)',
  'var(--color-accent-h2)',
  'var(--color-accent-h3)',
  'var(--color-accent-h4)',
] as const

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
  accent: string
}

const DayCell = React.memo(function DayCell({
  cell,
  isSelected,
  amount,
  heat,
  onSelect,
  accent,
}: {
  cell: Extract<CalendarDayCell, { type: 'day' }>
  isSelected: boolean
  amount: number
  heat: 0 | 1 | 2 | 3 | 4
  onSelect: (date: string) => void
  accent: string
}) {
  const { date, day, isToday, isFuture } = cell
  const hasSpend = amount > 0
  // On strong heat tints the accent-colored amount text loses contrast —
  // switch both texts to white there
  const strongHeat = hasSpend && heat >= 3

  // Background: selected → solid accent, spending → heat tint, else faint glass
  const bgColor = isSelected
    ? accent
    : hasSpend
      ? HEAT_BG[heat]
      : 'rgba(255,255,255,0.03)'

  // Day number color: always readable — near-white on dark, white on selected
  const dayColor = isSelected || strongHeat
    ? '#FFFFFF'
    : isToday
      ? accent
      : 'var(--color-text)'

  // Amount color
  const amtColor = isSelected || strongHeat
    ? 'rgba(255,255,255,0.9)'
    : 'var(--color-accent-dark)'

  return (
    <motion.button
      type="button"
      onClick={() => {
        triggerHaptic('light')
        onSelect(date)
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className="relative flex flex-col items-center justify-center w-full h-[56px] rounded-[14px] overflow-hidden"
      style={{
        background: bgColor,
        border: isToday && !isSelected
          ? `1.5px solid ${accent}`
          : '1.5px solid transparent',
        // Selected: soft accent glow + white inner ring (distinct from heat 4)
        boxShadow: isSelected
          ? '0 8px 20px -4px rgba(var(--color-accent-rgb), 0.45), inset 0 0 0 1.5px rgba(255,255,255,0.85)'
          : isToday
            ? '0 0 12px -2px rgba(var(--color-accent-rgb), 0.35)'
            : 'none',
        opacity: isFuture && !isToday ? 0.4 : 1,
      }}
    >
      {/* Day number — always prominent and visible */}
      <span
        className="leading-none"
        style={{
          fontSize: 15,
          fontWeight: isToday || isSelected ? 800 : 500,
          color: dayColor,
        }}
      >
        {day}
      </span>

      {/* Amount — fixed slot to keep all cells same height */}
      <span
        className="font-num leading-none mt-1"
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: amtColor,
          opacity: hasSpend ? 1 : 0,   // invisible but height-preserving
          pointerEvents: 'none',
        }}
      >
        {hasSpend ? formatShort(amount) : '0'}
      </span>

    </motion.button>
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
  accent,
}: CalendarGridProps) {
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX
    const dy = touchStartY.current - e.changedTouches[0].clientY
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx > 0) onSwipeLeft()
      else onSwipeRight()
    }
  }

  return (
    <div
      className="px-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="glass rounded-[24px] p-3">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAY_HEADERS.map((h, i) => (
          <div
            key={h}
            className="text-center text-[10px] font-bold tracking-wider py-1 opacity-80"
            style={{
              color: i === 6 ? 'var(--color-danger)' : 'var(--color-text-hint)',
            }}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <motion.div
        key={monthKey}
        initial={slideDir ? { x: slideDir === 'left' ? 20 : -20, opacity: 0 } : false}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-7 gap-1.5"
      >
        {days.map((cell) => {
          if (cell.type === 'empty') {
            return <div key={cell.key} className="h-[56px]" />
          }

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
              accent={accent}
            />
          )
        })}
      </motion.div>

      {/* Heat legend — explains the tint intensity */}
      <div className="flex items-center justify-end gap-1.5 mt-3 pr-1">
        <span className="text-[9px] text-text-hint font-medium">Ít</span>
        {HEAT_BG.slice(1).map((bg) => (
          <span
            key={bg}
            className="size-2.5 rounded-[4px]"
            style={{ background: bg }}
          />
        ))}
        <span className="text-[9px] text-text-hint font-medium">Nhiều</span>
      </div>
      </div>
    </div>
  )
}
