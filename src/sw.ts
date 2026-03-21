/// <reference lib="webworker" />
// ── Mochi Custom Service Worker ─────────────────────────────────
// Uses injectManifest mode — Workbox injects precache manifest here.
// Handles: precaching, offline, notification scheduling, notification click.

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare let self: ServiceWorkerGlobalScope & typeof globalThis


// Workbox precaching — __WB_MANIFEST is injected by vite-plugin-pwa
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// ── Notification click → open / focus app ──────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        const appClient = clients.find((c) => c.url.includes(self.location.origin))
        if (appClient) return appClient.focus()
        return self.clients.openWindow('/')
      }),
  )
})

// ── Periodic check via setInterval ────────────────────────────
// Interval active while SW is alive (typically while app is open
// or for a window after install). For a personal budget app this
// is good enough — notification fires when user has app backgrounded.

let checkInterval: ReturnType<typeof setInterval> | null = null

function startScheduleLoop() {
  if (checkInterval) return // already running
  // Check every minute
  checkInterval = setInterval(() => {
    void requestDataAndCheck()
  }, 60 * 1000)
  // Also check immediately
  void requestDataAndCheck()
}

async function requestDataAndCheck() {
  const clients = await self.clients.matchAll({ type: 'window' })
  for (const client of clients) {
    client.postMessage({ type: 'GET_NOTIFICATION_DATA' })
  }
}

// ── Message handler ────────────────────────────────────────────

self.addEventListener('message', (event) => {
  const data = event.data as Record<string, unknown> | null
  if (!data) return

  // App tells SW to start the schedule loop
  if (data.type === 'SCHEDULE_NOTIFICATION') {
    startScheduleLoop()
  }

  // App sends back notification data
  if (data.type === 'NOTIFICATION_DATA') {
    const { enabled, hour, recurringCount, lastNotifiedDate } = data as {
      enabled: boolean
      hour: number
      recurringCount: number
      lastNotifiedDate: string
    }

    if (!enabled) return
    if (!recurringCount || recurringCount === 0) return

    const now = new Date()
    const today = now.toISOString().split('T')[0]

    if (lastNotifiedDate === today) return    // already sent today
    if (now.getHours() < hour) return         // not time yet

    // Show the notification
    const body =
      recurringCount === 1
        ? 'Có 1 khoản lặp lại cần xác nhận hôm nay'
        : `Có ${recurringCount} khoản lặp lại cần xác nhận hôm nay`

    void self.registration.showNotification('Mochi 🍡', {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'mochi-daily',   // replaces previous — no spam
      data: { url: '/' },
    })

    // Tell app to save today as last-notified
    void self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        client.postMessage({ type: 'NOTIFICATION_SENT', date: today })
      }
    })
  }
})

// Start schedule loop when SW activates (e.g. after background install)
self.addEventListener('activate', () => {
  startScheduleLoop()
})
