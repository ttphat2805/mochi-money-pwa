import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCalendar } from '@/hooks/useCalendar'
import { useAppStore } from '@/stores/appStore'
import { CalendarGrid } from './CalendarGrid'
import { MonthSummary } from './MonthSummary'
import { DayDetailPanel } from './DayDetailPanel'

export function CalendarPage() {
  const cal = useCalendar()
  const { openQuickAdd } = useAppStore()
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)

  const handleAddForDay = () => {
    if (!cal.selectedDay) return
    openQuickAdd(cal.selectedDay)
  }

  const goNext = () => {
    setSlideDir('left')
    cal.goToNextMonth()
  }

  const goPrev = () => {
    setSlideDir('right')
    cal.goToPrevMonth()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 safe-top">
        <h1 className="text-[22px] font-semibold tracking-tight">Lịch chi tiêu</h1>
        <span className="text-text-muted text-[13px]">{cal.monthLabel}</span>
      </header>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto pb-6">
        {/* Month navigation */}
        <div className="flex items-center justify-between px-5 pb-2">
          <button
            type="button"
            onClick={goPrev}
            className="bg-surface active:bg-surface2 flex size-8 items-center justify-center rounded-full transition-colors"
            aria-label="Tháng trước"
          >
            <ChevronLeft className="size-4" />
          </button>

          <span className="text-[14px] font-semibold">{cal.monthLabel}</span>

          <button
            type="button"
            onClick={goNext}
            disabled={!cal.canGoNext}
            className="bg-surface active:bg-surface2 flex size-8 items-center justify-center rounded-full transition-colors disabled:opacity-30"
            aria-label="Tháng sau"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Calendar grid — handles swipe internally */}
        <CalendarGrid
          days={cal.calendarDays}
          dailyTotals={cal.dailyTotals}
          maxDailyAmount={cal.maxDailyAmount}
          selectedDay={cal.selectedDay}
          onSelectDay={cal.setSelectedDay}
          onSwipeLeft={goNext}
          onSwipeRight={goPrev}
          monthKey={cal.viewMonthKey}
          slideDir={slideDir}
        />

        {/* Month summary strip — fade transition on month change */}
        <div
          key={cal.viewMonthKey}
          className="mt-3"
          style={{ animation: 'fadeIn 250ms ease-out' }}
        >
          <MonthSummary stats={cal.monthStats} />
        </div>

        {/* Day detail panel — slides in on day selection */}
        <DayDetailPanel
          selectedDay={cal.selectedDay}
          transactions={cal.selectedDayTxs}
          today={cal.today}
          onAddTransaction={handleAddForDay}
        />
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
