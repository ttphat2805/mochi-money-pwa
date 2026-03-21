import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCalendar } from '@/hooks/useCalendar'
import { useQuickAdd } from '@/hooks/useQuickAdd'
import { CalendarGrid } from './CalendarGrid'
import { MonthSummary } from './MonthSummary'
import { DayDetailPanel } from './DayDetailPanel'
import { QuickAddSheet } from '@/features/quick-add/QuickAddSheet'

export function CalendarPage() {
  const cal = useCalendar()
  const quickAdd = useQuickAdd()

  const handleAddForDay = () => {
    if (!cal.selectedDay) return
    quickAdd.setDate(cal.selectedDay)
    quickAdd.open()
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
            onClick={cal.goToPrevMonth}
            className="bg-surface active:bg-surface2 flex size-8 items-center justify-center rounded-full transition-colors"
            aria-label="Tháng trước"
          >
            <ChevronLeft className="size-4" />
          </button>

          <span className="text-[14px] font-semibold">{cal.monthLabel}</span>

          <button
            type="button"
            onClick={cal.goToNextMonth}
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
          onSwipeLeft={cal.goToNextMonth}
          onSwipeRight={cal.goToPrevMonth}
        />

        {/* Month summary strip */}
        <div className="mt-3">
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

      {/* QuickAdd sheet — pre-filled with selected day's date */}
      <QuickAddSheet quickAdd={quickAdd} />
    </div>
  )
}
