import { Settings } from 'lucide-react'
import { usePersonalization } from '@/hooks/usePersonalization'

interface TopBarProps {
  onSettingsTap: () => void
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Chào buổi sáng'
  if (hour >= 12 && hour < 18) return 'Chào buổi chiều'
  if (hour >= 18 && hour < 22) return 'Chào buổi tối'
  return 'Chào đêm khuya'
}

export function TopBar({ onSettingsTap }: TopBarProps) {
  const { settings } = usePersonalization()
  const greeting = getGreeting()

  return (
    <header className="relative z-10 flex items-center justify-between px-5 pt-4 pb-3 safe-top">
      <div>
        <p className="text-white/75 text-[11px] font-semibold tracking-wide mb-0.5">
          {greeting}
        </p>
        <h1 className="text-[24px] font-black text-white tracking-tight leading-tight drop-shadow-sm">
          {settings.appName}
        </h1>
      </div>

      <button
        type="button"
        onClick={onSettingsTap}
        className="!min-h-9 flex size-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-sm active:scale-95 transition-transform"
        aria-label="Cài đặt"
      >
        <Settings className="size-[18px] text-white drop-shadow-sm" />
      </button>
    </header>
  )
}
