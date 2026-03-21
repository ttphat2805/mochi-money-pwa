// ── Notification settings ─────────────────────────────────────

export interface NotificationSettings {
  enabled: boolean
  hour: number         // 5 – 22
  lastNotifiedDate: string  // 'YYYY-MM-DD' or ''
}

const STORAGE_KEY = 'mochi-notification-settings'

export function getNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { enabled: false, hour: 8, lastNotifiedDate: '' }
    return JSON.parse(raw) as NotificationSettings
  } catch {
    return { enabled: false, hour: 8, lastNotifiedDate: '' }
  }
}

export function saveNotificationSettings(
  partial: Partial<NotificationSettings>,
): NotificationSettings {
  const current = getNotificationSettings()
  const next: NotificationSettings = { ...current, ...partial }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

// ── Feature detection ─────────────────────────────────────────

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator
}

export function isStandaloneMode(): boolean {
  return (
    (navigator as unknown as { standalone?: boolean }).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  )
}

// ── SW communication ──────────────────────────────────────────

/** Tell the SW to start its 1-minute schedule loop. */
export async function startNotificationSchedule(): Promise<void> {
  if (!('serviceWorker' in navigator)) return
  try {
    const reg = await navigator.serviceWorker.ready
    reg.active?.postMessage({ type: 'SCHEDULE_NOTIFICATION' })
  } catch {
    // SW not available — silently ignore
  }
}

/** Set up the handler that responds to SW data requests. */
export function setupSWMessageHandler(
  getRecurringCount: () => number,
): () => void {
  if (!('serviceWorker' in navigator)) return () => {}

  const handler = (event: MessageEvent) => {
    const data = event.data as { type?: string; date?: string } | null
    if (!data) return

    if (data.type === 'GET_NOTIFICATION_DATA') {
      const settings = getNotificationSettings()
      // Reply directly to the SW
      ;(event.source as ServiceWorker | null)?.postMessage({
        type: 'NOTIFICATION_DATA',
        enabled: settings.enabled,
        hour: settings.hour,
        recurringCount: getRecurringCount(),
        lastNotifiedDate: settings.lastNotifiedDate,
      })
    }

    if (data.type === 'NOTIFICATION_SENT' && data.date) {
      saveNotificationSettings({ lastNotifiedDate: data.date })
    }
  }

  navigator.serviceWorker.addEventListener('message', handler)
  return () => navigator.serviceWorker.removeEventListener('message', handler)
}
