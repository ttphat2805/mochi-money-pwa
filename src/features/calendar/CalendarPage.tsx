import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Flame, Leaf } from 'lucide-react'
import { useCalendar } from '@/hooks/useCalendar'
import { triggerHaptic } from '@/lib/haptic'
import { useAppStore } from '@/stores/appStore'
import { CalendarGrid } from './CalendarGrid'
import { MonthSummary } from './MonthSummary'
import { DayDetailPanel } from './DayDetailPanel'
import { useShouldShowSkeleton } from '@/hooks/useShouldShowSkeleton'
import { CalendarSkeleton } from './CalendarSkeleton'
import { useCalendarStreaks } from './useCalendarStreaks'
import { motion, AnimatePresence } from 'framer-motion'
import { usePersonalization } from '@/hooks/usePersonalization'
import { formatVND, tint } from '@/lib/utils'

export function CalendarPage() {
  const cal = useCalendar()
  const { openQuickAdd, setCalendarSelectedDay } = useAppStore()
  const { settings } = usePersonalization()
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)
  const showSkeleton = useShouldShowSkeleton(cal.isLoading)
  const accent = settings.accentColor
  const panelRef = useRef<HTMLDivElement>(null)
  const { streak, noSpendDays } = useCalendarStreaks(cal.calendarDays, cal.dailyTotals, cal.today)

  // "Hôm nay" is only useful when we're not already looking at today
  const isViewingToday =
    cal.viewMonthKey === cal.today.slice(0, 7) &&
    (!cal.selectedDay || cal.selectedDay === cal.today)

  // Bring the day detail panel into view when a day is picked
  useEffect(() => {
    if (!cal.selectedDay) return
    const t = setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 220) // after the panel's enter animation settles
    return () => clearTimeout(t)
  }, [cal.selectedDay])

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

  // Blocked navigation (button disabled / swipe past the limit) is a no-op —
  // no haptic, no slide direction change
  const goNext = () => {
    if (!cal.canGoNext) return
    triggerHaptic('light')
    setSlideDir('left')
    cal.goToNextMonth()
  }

  const goPrev = () => {
    if (!cal.canGoPrev) return
    triggerHaptic('light')
    setSlideDir('right')
    cal.goToPrevMonth()
  }

  // Header copy describes the month the loaded numbers belong to
  const [dataYear, dataMonth] = cal.dataMonthKey.split('-')
  const monthPhrase = cal.dataMonthKey === cal.today.slice(0, 7)
    ? 'tháng này'
    : `tháng ${Number(dataMonth)}/${dataYear}`
  const headerCopy = cal.isLoading
    ? '\u00A0' // keep the line height; never claim "no spending" before data arrives
    : cal.monthStats.total > 0
      ? `Đã chi ${formatVND(cal.monthStats.total)}đ ${monthPhrase}`
      : `Chưa có chi tiêu ${monthPhrase}`

  return (
    <div className="flex h-full flex-col app-ambient relative overflow-hidden">

      {/* ── Header ── */}
      <header className="relative z-10 px-5 pt-4 pb-3 safe-top shrink-0">
        {/* Page title row */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-[12px] text-text-muted font-semibold mb-0.5">
              {headerCopy}
            </p>
            <h1 className="text-[26px] font-black text-text tracking-tight leading-tight">
              Lịch
            </h1>
          </div>

          {/* Today pill — only when not already viewing today */}
          {!isViewingToday && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light')
                cal.goToToday()
              }}
              className="relative !min-h-8 mb-1 h-8 px-3.5 rounded-full text-[11px] font-bold transition-all active:scale-95 border after:absolute after:-inset-x-1 after:-inset-y-1.5 after:content-['']"
              style={{
                background: tint(accent, 14),
                borderColor: tint(accent, 30),
                color: 'var(--color-accent-dark)',
              }}
            >
              Hôm nay
            </button>
          )}
        </div>

        {/* Month navigation — glass arrow buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goPrev}
            className="glass size-11 flex items-center justify-center rounded-full active:scale-95 transition-transform"
            aria-label="Tháng trước"
          >
            <ChevronLeft className="size-[18px] text-text" />
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
            className="glass size-11 flex items-center justify-center rounded-full active:scale-95 transition-transform disabled:opacity-30"
            aria-label="Tháng sau"
          >
            <ChevronRight className="size-[18px] text-text" />
          </button>
        </div>
      </header>

      {/* ── Scrollable body ── */}
      <div className="flex-1 min-h-0 relative z-10 overflow-y-auto scrollbar-hide pb-24">
        <div className="flex flex-col gap-4 pt-1 pb-4">
          {cal.isLoading ? (
            <CalendarSkeleton
              weeks={Math.ceil(cal.calendarDays.length / 7)}
              visible={showSkeleton}
            />
          ) : (
            <>
              {/* Calendar grid */}
              <CalendarGrid
                days={cal.calendarDays}
                dailyTotals={cal.dailyTotals}
                heatScaleMax={cal.heatScaleMax}
                selectedDay={cal.selectedDay}
                onSelectDay={cal.toggleSelectedDay}
                onSwipeLeft={goNext}
                onSwipeRight={goPrev}
                monthKey={cal.viewMonthKey}
                slideDir={slideDir}
                accent={accent}
                noSpendDays={noSpendDays}
              />

              {/* Streak + no-spend row — hidden when there's nothing to celebrate */}
              {(streak > 0 || noSpendDays.size > 0) && (
                <div className="px-4">
                  <div className="glass rounded-[20px] px-4 py-2.5 flex items-center justify-between gap-3">
                    {streak > 0 && (
                      <span className="flex items-center gap-1.5 text-[12px] font-bold text-text">
                        <Flame size={14} strokeWidth={2.5} className="text-orange-400" />
                        Chuỗi ghi chép: <span className="font-num">{streak}</span> ngày
                      </span>
                    )}
                    {noSpendDays.size > 0 && (
                      <span className="flex items-center gap-1.5 text-[12px] font-semibold text-text-muted ml-auto">
                        <Leaf size={13} strokeWidth={2.5} style={{ color: 'var(--color-success)' }} />
                        <span className="font-num">{noSpendDays.size}</span> ngày không chi tiêu
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Day detail panel — the container stays mounted while a day is
                  selected; switching days only crossfades the inner content
                  (both stacked in one grid cell, so the height never collapses
                  and MonthSummary below doesn't jump). */}
              <AnimatePresence>
                {cal.selectedDay && (
                  <motion.div
                    ref={panelRef}
                    key="day-panel"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="px-4 grid"
                  >
                    <AnimatePresence initial={false}>
                      <motion.div
                        key={cal.selectedDay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="[grid-area:1/1] min-w-0"
                      >
                        <DayDetailPanel
                          selectedDay={cal.selectedDay}
                          transactions={cal.selectedDayTxs}
                          today={cal.today}
                          onAddTransaction={handleAddForDay}
                        />
                      </motion.div>
                    </AnimatePresence>
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
