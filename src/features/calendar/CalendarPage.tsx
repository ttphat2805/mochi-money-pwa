import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCalendar } from '@/hooks/useCalendar'
import { useAppStore } from '@/stores/appStore'
import { CalendarGrid } from './CalendarGrid'
import { MonthSummary } from './MonthSummary'
import { DayDetailPanel } from './DayDetailPanel'
import { useShouldShowSkeleton } from '@/hooks/useShouldShowSkeleton'
import { CalendarSkeleton } from './CalendarSkeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { usePersonalization } from '@/hooks/usePersonalization'
import { formatVND } from '@/lib/utils'

export function CalendarPage() {
  const cal = useCalendar()
  const { openQuickAdd, setCalendarSelectedDay } = useAppStore()
  const { settings } = usePersonalization()
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)
  const showSkeleton = useShouldShowSkeleton(cal.isLoading)
  const accent = settings.accentColor || '#E8A020'

  useEffect(() => {
    setCalendarSelectedDay(cal.selectedDay)
  }, [cal.selectedDay, setCalendarSelectedDay])

  useEffect(() => {
    return () => setCalendarSelectedDay(null)
  }, [setCalendarSelectedDay])

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

      {/* ── Header ── */}
      <header className="relative z-10 px-5 pt-5 pb-3 safe-top shrink-0">
        {/* Page title row */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <h1 className="text-[26px] font-black text-text tracking-tight leading-none">
              Lịch
            </h1>
            <p className="text-[12px] text-text-muted mt-1 font-medium">
              {cal.monthStats.total > 0
                ? `Đã chi ${formatVND(cal.monthStats.total)}đ tháng này`
                : 'Chưa có chi tiêu tháng này'}
            </p>
          </div>

          {/* Today pill — small, unobtrusive */}
          <button
            type="button"
            onClick={cal.goToToday}
            className="mb-0.5 h-7 px-3 rounded-full text-[11px] font-bold transition-all active:scale-90"
            style={{
              background: `${accent}18`,
              color: accent,
            }}
          >
            Hôm nay
          </button>
        </div>

        {/* Month navigation — inline, no card buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goPrev}
            className="size-8 flex items-center justify-center rounded-full active:bg-black/8 transition-colors"
            aria-label="Tháng trước"
          >
            <ChevronLeft className="size-[18px] text-text-muted" />
          </button>

          <motion.div
            key={cal.viewMonthKey}
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="flex-1 text-center"
          >
            <span className="text-[17px] font-black text-text tracking-tight">
              {cal.monthLabel}
            </span>
          </motion.div>

          <button
            type="button"
            onClick={goNext}
            disabled={!cal.canGoNext}
            className="size-8 flex items-center justify-center rounded-full active:bg-black/8 transition-colors disabled:opacity-25"
            aria-label="Tháng sau"
          >
            <ChevronRight className="size-[18px] text-text-muted" />
          </button>
        </div>
      </header>

      {/* ── Scrollable body ── */}
      <div className="flex-1 min-h-0 relative z-10 overflow-y-auto scrollbar-hide pb-24">
        <div className="flex flex-col gap-4 pt-1">
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
                onSelectDay={(date) => cal.setSelectedDay(cal.selectedDay === date ? null : date)}
                onSwipeLeft={goNext}
                onSwipeRight={goPrev}
                monthKey={cal.viewMonthKey}
                slideDir={slideDir}
                accent={accent}
              />

              {/* Day detail panel — inline, animated */}
              <AnimatePresence mode="wait">
                {cal.selectedDay && (
                  <motion.div
                    key={cal.selectedDay}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="px-4"
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

              {/* Month summary */}
              <motion.div
                key={cal.viewMonthKey}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.22 }}
              >
                <MonthSummary stats={cal.monthStats} />
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
