import { Settings } from 'lucide-react'
import { getVietnameseDay } from '@/lib/utils'

interface TopBarProps {
  onSettingsTap: () => void
}

export function TopBar({ onSettingsTap }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-5 py-3 safe-top">
      <div>
        <p className="text-text-hint text-[11px] font-medium tracking-wide">
          {getVietnameseDay()}
        </p>
        <h1 className="text-[22px] font-bold text-text tracking-tight leading-tight">
          Chi Tiêu
        </h1>
      </div>
      <button
        type="button"
        onClick={onSettingsTap}
        className="flex size-9 items-center justify-center rounded-full bg-white border border-border shadow-sm active:scale-95 transition-transform"
        aria-label="Cài đặt"
      >
        <Settings className="size-4 text-text-muted" />
      </button>
    </header>
  )
}
