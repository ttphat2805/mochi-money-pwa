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
    <header className="relative z-10 flex items-center justify-between px-5 pt-4 pb-4 safe-top">
      <div>
        <p className="text-text-muted text-[12px] font-semibold mb-0.5">
          {greeting} 👋
        </p>
        <h1 className="text-[26px] font-black text-text tracking-tight leading-tight">
          {settings.appName}
        </h1>
      </div>

      <button
        type="button"
        onClick={onSettingsTap}
        className="!min-h-10 flex size-11 items-center justify-center rounded-2xl glass active:scale-95 transition-transform"
        aria-label="Cài đặt"
      >
        <Settings className="size-[18px] text-text" />
      </button>
    </header>
  )
}
