import { useState, useEffect, useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { toast } from 'sonner'
import { db } from '@/lib/db'
import { getTodayString } from '@/lib/utils'
import {
  getNotificationSettings,
  saveNotificationSettings,
  startNotificationSchedule,
  setupSWMessageHandler,
  isNotificationSupported,
  isStandaloneMode,
} from '@/lib/notifications'

// ── Recurring count: templates active today that haven't been ticked ──

function useUntouchedRecurringCount(): number {
  const today = getTodayString()
  const [dayOfWeek] = useState(() => new Date(today + 'T00:00:00').getDay())

  const count = useLiveQuery(async () => {
    const templates = await db.recurringTemplates
      .filter((t) => Boolean(t.active))
      .toArray()

    const tickedTxs = await db.transactions
      .where('date').equals(today)
      .filter((tx) => tx.type === 'recurring' && !tx.deletedAt)
      .toArray()

    const tickedIds = new Set(tickedTxs.map((tx) => tx.recurringId))

    // Filter templates that run today based on their schedule
    const todayTemplates = templates.filter((t) => {
      const s = t.schedule
      if (s === 'daily') return true
      if (s === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5
      // number[] — array of day-of-week values (0=Sun…6=Sat)
      if (Array.isArray(s)) return s.includes(dayOfWeek)
      return false
    })

    return todayTemplates.filter((t) => !tickedIds.has(t.id)).length
  }, [today, dayOfWeek])

  return count ?? 0
}

// ── Main hook ─────────────────────────────────────────────────

export function useNotifications() {
  const [settings, setSettings] = useState(() => getNotificationSettings())
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  )

  const recurringCount = useUntouchedRecurringCount()

  // Register SW message handler + start schedule if already enabled
  useEffect(() => {
    const cleanup = setupSWMessageHandler(() => recurringCount)
    if (settings.enabled) {
      void startNotificationSchedule()
    }
    return cleanup
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // only on mount — recurringCount updated via closure refresh

  // Re-register handler when recurringCount changes (closure update)
  useEffect(() => {
    const cleanup = setupSWMessageHandler(() => recurringCount)
    return cleanup
  }, [recurringCount])

  const enable = useCallback(async () => {
    if (!isNotificationSupported()) {
      toast.error('Thiết bị không hỗ trợ thông báo')
      return
    }
    if (!isStandaloneMode()) {
      toast('Cần cài app lên màn hình chính trước', {
        description: 'Tap Share → Add to Home Screen',
      })
      return
    }
    if (Notification.permission === 'denied') {
      toast.error('Thông báo bị chặn · Vào Cài đặt iPhone → Safari → Thông báo')
      return
    }

    let perm: NotificationPermission = Notification.permission
    if (perm === 'default') {
      perm = await Notification.requestPermission()
      setPermission(perm)
    }

    if (perm === 'granted') {
      const next = saveNotificationSettings({ enabled: true })
      setSettings(next)
      await startNotificationSchedule()
      toast.success('Đã bật nhắc nhở')
    } else {
      toast.error('Không thể bật thông báo · Kiểm tra cài đặt')
    }
  }, [])

  const disable = useCallback(() => {
    const next = saveNotificationSettings({ enabled: false })
    setSettings(next)
    toast('Đã tắt nhắc nhở')
  }, [])

  const setHour = useCallback((hour: number) => {
    const next = saveNotificationSettings({ hour })
    setSettings(next)
  }, [])

  return {
    enabled: settings.enabled,
    hour: settings.hour,
    permission,
    isSupported: isNotificationSupported(),
    isInstalled: isStandaloneMode(),
    recurringCount,
    enable,
    disable,
    setHour,
  }
}
