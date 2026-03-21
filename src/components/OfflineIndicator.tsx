import { useState, useEffect } from 'react'

function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return online
}

export function OfflineIndicator() {
  const online = useOnlineStatus()
  const [show, setShow] = useState(false)

  // Brief delay to avoid flash on slow connections
  useEffect(() => {
    if (!online) {
      setShow(true)
    } else {
      // Keep visible briefly when recovering so user sees "back online"
      const t = setTimeout(() => setShow(false), 1500)
      return () => clearTimeout(t)
    }
  }, [online])

  if (!show) return null

  return (
    <div
      className="fixed inset-x-0 z-[100] flex items-center justify-center py-1.5 text-[12px] font-medium text-white transition-all"
      style={{
        top: 'env(safe-area-inset-top, 0px)',
        backgroundColor: online ? '#2A9D6E' : '#1A1A18',
      }}
    >
      {online
        ? '✓ Đã kết nối lại'
        : '⚡ Đang offline · Dữ liệu đã lưu trên thiết bị'}
    </div>
  )
}
