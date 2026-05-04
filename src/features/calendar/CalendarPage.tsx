import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { useCalendar } from '@/hooks/useCalendar'
import { useAppStore } from '@/stores/appStore'
import { CalendarGrid } from './CalendarGrid'
import { MonthSummary } from './MonthSummary'
import { DayDetailPanel } from './DayDetailPanel'
import { useShouldShowSkeleton } from '@/hooks/useShouldShowSkeleton'
import { CalendarSkeleton } from './CalendarSkeleton'
import { motion, AnimatePresence } from 'framer-motion'

export function CalendarPage() {
  const cal = useCalendar()
  const { openQuickAdd } = useAppStore()
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)
  const showSkeleton = useShouldShowSkeleton(cal.isLoading)

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
    <div className="flex h-full flex-col bg-surface relative overflow-hidden">
      
      {/* Header & Month Navigation */}
      <header className="relative z-10 px-5 pt-4 pb-2 safe-top">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
               <CalendarIcon className="size-5 text-accent" />
            </div>
            <div>
              <h1 className="text-[22px] font-black text-text tracking-tight leading-none drop-shadow-sm">
                Lịch chi tiêu
              </h1>
            </div>
          </div>
        </div>

        {/* Month Navigation Pill */}
        <div className="bg-white rounded-2xl p-1 border border-border/60 shadow-sm flex items-center justify-between">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-10 w-12 items-center justify-center rounded-xl active:bg-surface transition-all active:scale-95"
            aria-label="Tháng trước"
          >
            <ChevronLeft className="size-5 text-text-muted" />
          </button>

          <div className="flex-1 text-center">
            <span className="text-[15px] font-bold text-text tracking-tight uppercase">{cal.monthLabel}</span>
          </div>

          <button
            type="button"
            onClick={goNext}
            disabled={!cal.canGoNext}
            className="flex h-10 w-12 items-center justify-center rounded-xl active:bg-surface transition-all active:scale-95 disabled:opacity-30"
            aria-label="Tháng sau"
          >
            <ChevronRight className="size-5 text-text-muted" />
          </button>
        </div>
      </header>

      {/* Scrollable body */}
      <div className="flex-1 min-h-0 relative z-10 overflow-y-auto scrollbar-hide pb-20">
        <div className="flex flex-col gap-4 pt-2">
          {showSkeleton ? (
            <CalendarSkeleton />
          ) : (
            <>
              {/* Calendar grid */}
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

              {/* Month summary cards */}
              <motion.div
                key={cal.viewMonthKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-1"
              >
                <MonthSummary stats={cal.monthStats} />
              </motion.div>

              {/* Day detail panel */}
              <AnimatePresence mode="wait">
                {cal.selectedDay && (
                  <motion.div
                    key="day-detail"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-visible" 
                  >
                    <DayDetailPanel
                      selectedDay={cal.selectedDay}
                      transactions={cal.selectedDayTxs}
                      today={cal.today}
                      onAddTransaction={handleAddForDay}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
