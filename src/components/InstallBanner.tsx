import { useState, useEffect } from 'react'

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone(): boolean {
  return (
    (navigator as unknown as { standalone?: boolean }).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  )
}

function shouldShowBanner(): boolean {
  if (isStandalone()) return false
  if (!isIOS()) return false
  if (localStorage.getItem('install-banner-dismissed')) return false
  return true
}

export function InstallBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!shouldShowBanner()) return
    const timer = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  const dismiss = () => {
    localStorage.setItem('install-banner-dismissed', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed left-4 right-4 z-40"
      style={{
        bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <div
        className="flex items-start gap-3 rounded-2xl p-4"
        style={{ backgroundColor: '#1A1A18' }}
      >
        <span className="text-2xl leading-none">🍡</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white mb-0.5">
            Cài Mochi lên màn hình chính
          </p>
          <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Nhấn <strong className="text-white">Chia sẻ</strong> →{' '}
            <strong className="text-white">Thêm vào màn hình chính</strong>{' '}
            để dùng offline
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="text-[20px] leading-none p-1 shrink-0"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          aria-label="Đóng"
        >
          ×
        </button>
      </div>
    </div>
  )
}
