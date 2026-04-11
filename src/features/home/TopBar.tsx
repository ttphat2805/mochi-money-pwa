import { Settings } from 'lucide-react'
import { getVietnameseDay } from '@/lib/utils'
import { usePersonalization } from '@/hooks/usePersonalization'

interface TopBarProps {
  onSettingsTap: () => void
}

export function TopBar({ onSettingsTap }: TopBarProps) {
  const { settings } = usePersonalization()

  return (
    <header className="relative z-10 flex items-center justify-between px-5 py-4 safe-top">
      <div>
        <p className="text-white/90 text-[11px] font-bold tracking-widest uppercase mb-0.5">
          {getVietnameseDay()}
        </p>
        <h1 className="text-[26px] font-black text-white tracking-tight leading-tight drop-shadow-md">
          {settings.appName}
        </h1>
      </div>
      <button
        type="button"
        onClick={onSettingsTap}
        className="!min-h-9 flex size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-sm active:scale-95 transition-transform"
        aria-label="Cài đặt"
      >
        <Settings className="size-5 text-white drop-shadow-sm" />
      </button>
    </header>
  )
}
