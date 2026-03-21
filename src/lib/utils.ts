import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with clsx.
 * Used by shadcn/ui components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Vietnamese Dong (VND).
 * Uses dot separator: 35000 → "35.000"
 * Stored as a raw number in DB, only formatted for display.
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount)
}

/**
 * Get today's date as 'YYYY-MM-DD' string in Asia/Ho_Chi_Minh timezone.
 * All dates in the app are stored as strings, never Date objects.
 */
export function getTodayString(): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date())
}

/**
 * Get current month as 'YYYY-MM' string in Asia/Ho_Chi_Minh timezone.
 */
export function getCurrentMonthString(): string {
  return getTodayString().slice(0, 7)
}

/**
 * Parse raw VND input string → number.
 * Strips all dot separators: "1.200.000" → 1200000
 */
export function parseVNDInput(display: string): number {
  const digits = display.replace(/\D/g, '')
  return parseInt(digits || '0', 10)
}

/**
 * Number of days remaining in the current month (inclusive of today),
 * minimum 1 to avoid division by zero.
 */
export function getDaysLeftInMonth(): number {
  const today = getTodayString()
  const [year, month] = today.split('-').map(Number)
  const lastDay = new Date(year, month, 0).getDate()
  const currentDay = parseInt(today.slice(8, 10), 10)
  return Math.max(1, lastDay - currentDay + 1)
}

/**
 * Format a 'YYYY-MM-DD' string to a Vietnamese day label.
 */
export function getVietnameseDateLabel(dateStr: string): string {
  const today = getTodayString()
  if (dateStr === today) return 'Hôm nay'
  const todayDate = new Date(today + 'T00:00:00+07:00')
  todayDate.setDate(todayDate.getDate() - 1)
  const yesterday = todayDate.toISOString().slice(0, 10)
  if (dateStr === yesterday) return 'Hôm qua'
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

/**
 * Get Vietnamese weekday + date string, e.g. "Thứ Tư, 20 tháng 3"
 */
export function getVietnameseDay(): string {
  const today = getTodayString()
  const date = new Date(today + 'T00:00:00+07:00')
  const dow = date.getDay()
  const WEEKDAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']
  const [, month, day] = today.split('-').map(Number)
  return `${WEEKDAYS[dow]}, ${day} tháng ${month}`
}

/**
 * Compact amount for small spaces: 95000→"95k", 1500000→"1.5tr"
 */
export function formatShort(amount: number): string {
  if (amount <= 0) return ''
  if (amount >= 1_000_000) {
    const val = amount / 1_000_000
    const str = val % 1 === 0 ? String(val) : val.toFixed(1)
    return `${str}tr`
  }
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}k`
  return String(amount)
}

/**
 * Returns last 6 month keys as 'YYYY-MM' strings, oldest first.
 * Uses Asia/Ho_Chi_Minh-aware current month.
 */
export function getLast6Months(): string[] {
  const todayStr = getTodayString()
  const [year, month] = todayStr.split('-').map(Number)
  const result: string[] = []
  for (let i = 5; i >= 0; i--) {
    const m = new Date(year, month - 1 - i, 1)
    result.push(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`)
  }
  return result
}

/**
 * 'YYYY-MM' → short label: 'T3', 'T10'
 */
export function getMonthLabel(monthKey: string): string {
  return `T${parseInt(monthKey.slice(5, 7), 10)}`
}
/**
 * Get total days in a specific month.
 * Month is 1-indexed (1=Jan, 12=Dec).
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * Format an ISO timestamp to Vietnamese datetime string.
 * e.g. "14:30 · 18/03/2026"
 */
export function formatDateTime(isoString: string): string {
  const d = new Date(isoString)
  const time = new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(d)
  const date = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(d)
  return `${time} · ${date}`
}

/**
 * Short date label: "Hôm nay", "Hôm qua", or "d/M".
 */
export function getDateLabel(dateStr: string): string {
  const today = getTodayString()
  if (dateStr === today) return 'Hôm nay'
  const todayDate = new Date(today + 'T00:00:00+07:00')
  todayDate.setDate(todayDate.getDate() - 1)
  const yesterday = todayDate.toISOString().slice(0, 10)
  if (dateStr === yesterday) return 'Hôm qua'
  const [, month, day] = dateStr.split('-')
  return `${parseInt(day)}/${parseInt(month)}`
}
