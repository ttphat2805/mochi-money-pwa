import { useState, useCallback, useMemo } from 'react'
import { getTodayString } from '@/lib/utils'

export type DateShortcut = 'today' | 'yesterday' | '2days' | 'custom'

interface DayCell {
  date: string      // 'YYYY-MM-DD'
  day: number        // 1-31
  isCurrentMonth: boolean
  isToday: boolean
  isFuture: boolean
  isSelected: boolean
}

interface UseDatePickerReturn {
  // State
  selectedDate: string
  activeShortcut: DateShortcut
  currentMonth: number   // 0-11
  currentYear: number
  showCalendar: boolean
  monthLabel: string
  dayGrid: DayCell[][]

  // Actions
  selectShortcut: (shortcut: DateShortcut) => void
  selectDay: (date: string) => void
  prevMonth: () => void
  nextMonth: () => void
  confirm: () => string
  reset: (initialDate?: string) => void
}

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const

function getDateNDaysAgo(n: number): string {
  const today = new Date(getTodayString() + 'T00:00:00+07:00')
  today.setDate(today.getDate() - n)
  return today.toISOString().slice(0, 10)
}

function detectShortcut(dateStr: string): DateShortcut {
  if (dateStr === getTodayString()) return 'today'
  if (dateStr === getDateNDaysAgo(1)) return 'yesterday'
  if (dateStr === getDateNDaysAgo(2)) return '2days'
  return 'custom'
}

function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  const formatted = `${day}/${month}/${year}`
  const shortcut = detectShortcut(dateStr)

  switch (shortcut) {
    case 'today':
      return `Hôm nay · ${formatted}`
    case 'yesterday':
      return `Hôm qua · ${formatted}`
    case '2days':
      return `2 ngày trước · ${formatted}`
    default:
      return formatted
  }
}

const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
] as const

function generateDayGrid(year: number, month: number, selectedDate: string, todayStr: string): DayCell[][] {
  const firstDay = new Date(year, month, 1)
  // Monday-first: getDay() 0=Sun → we need Mon=0
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const cells: DayCell[] = []

  // Previous month fill
  for (let i = startDow - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i
    const m = month === 0 ? 12 : month
    const y = month === 0 ? year - 1 : year
    const date = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({
      date,
      day: d,
      isCurrentMonth: false,
      isToday: date === todayStr,
      isFuture: date > todayStr,
      isSelected: date === selectedDate,
    })
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({
      date,
      day: d,
      isCurrentMonth: true,
      isToday: date === todayStr,
      isFuture: date > todayStr,
      isSelected: date === selectedDate,
    })
  }

  // Next month fill
  const remaining = 7 - (cells.length % 7)
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const m = month === 11 ? 1 : month + 2
      const y = month === 11 ? year + 1 : year
      const date = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      cells.push({
        date,
        day: d,
        isCurrentMonth: false,
        isToday: date === todayStr,
        isFuture: date > todayStr,
        isSelected: date === selectedDate,
      })
    }
  }

  // Chunk into weeks
  const weeks: DayCell[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  return weeks
}

export function useDatePicker(initialDate?: string): UseDatePickerReturn {
  const todayStr = getTodayString()
  const startDate = initialDate ?? todayStr

  const [selectedDate, setSelectedDate] = useState(startDate)
  const [activeShortcut, setActiveShortcut] = useState<DateShortcut>(() => detectShortcut(startDate))
  const [showCalendar, setShowCalendar] = useState(false)

  // Parse selected date for calendar view month
  const [currentYear, setCurrentYear] = useState(() => parseInt(startDate.slice(0, 4), 10))
  const [currentMonth, setCurrentMonth] = useState(() => parseInt(startDate.slice(5, 7), 10) - 1)

  const monthLabel = useMemo(
    () => `${MONTH_NAMES[currentMonth]} · ${currentYear}`,
    [currentMonth, currentYear],
  )

  const dayGrid = useMemo(
    () => generateDayGrid(currentYear, currentMonth, selectedDate, todayStr),
    [currentYear, currentMonth, selectedDate, todayStr],
  )

  const selectShortcut = useCallback((shortcut: DateShortcut) => {
    setActiveShortcut(shortcut)

    if (shortcut === 'custom') {
      setShowCalendar(true)
      return
    }

    setShowCalendar(false)
    let date: string
    switch (shortcut) {
      case 'today':
        date = getTodayString()
        break
      case 'yesterday':
        date = getDateNDaysAgo(1)
        break
      case '2days':
        date = getDateNDaysAgo(2)
        break
    }

    setSelectedDate(date)
    // Navigate calendar to that month
    setCurrentYear(parseInt(date.slice(0, 4), 10))
    setCurrentMonth(parseInt(date.slice(5, 7), 10) - 1)
  }, [])

  const selectDay = useCallback((date: string) => {
    setSelectedDate(date)
    const detected = detectShortcut(date)
    setActiveShortcut(detected === 'custom' ? 'custom' : detected)
  }, [todayStr])

  const prevMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((y) => y - 1)
        return 11
      }
      return prev - 1
    })
  }, [])

  const nextMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      const nextM = prev === 11 ? 0 : prev + 1
      if (prev === 11) {
        setCurrentYear((y) => y + 1)
      }
      return nextM
    })
  }, [currentYear])

  const confirm = useCallback(() => {
    return selectedDate
  }, [selectedDate])

  const reset = useCallback((initial?: string) => {
    const d = initial ?? getTodayString()
    setSelectedDate(d)
    setActiveShortcut(detectShortcut(d))
    setShowCalendar(false)
    setCurrentYear(parseInt(d.slice(0, 4), 10))
    setCurrentMonth(parseInt(d.slice(5, 7), 10) - 1)
  }, [])

  return {
    selectedDate,
    activeShortcut,
    currentMonth,
    currentYear,
    showCalendar,
    monthLabel,
    dayGrid,
    selectShortcut,
    selectDay,
    prevMonth,
    nextMonth,
    confirm,
    reset,
  }
}

export { WEEKDAY_LABELS, formatDateLabel, detectShortcut }
export type { DayCell }
