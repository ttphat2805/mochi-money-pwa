import { useEffect, useRef } from 'react'

interface DayOfMonthPickerProps {
  value: number        // 1–31
  onChange: (day: number) => void
}

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

export function DayOfMonthPicker({ value, onChange }: DayOfMonthPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll active chip into view when value changes
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const chip = container.querySelector(`[data-day="${value}"]`) as HTMLElement
    if (!chip) return
    const offset = chip.offsetLeft - container.offsetWidth / 2 + chip.offsetWidth / 2
    container.scrollTo({ left: offset, behavior: 'smooth' })
  }, [value])

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto py-1 scrollbar-hide"
    >
      {DAYS.map((day) => (
        <button
          key={day}
          type="button"
          data-day={day}
          onClick={() => onChange(day)}
          className={`flex shrink-0 size-9 items-center justify-center rounded-full text-[13px] font-medium transition-colors ${
            day === value
              ? 'bg-accent text-white'
              : 'bg-surface text-text-muted active:bg-surface2'
          }`}
        >
          {day}
        </button>
      ))}
    </div>
  )
}
