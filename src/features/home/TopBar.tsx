import { Settings } from 'lucide-react'

interface TopBarProps {
  onSettingsTap: () => void
}

export function TopBar({ onSettingsTap }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-5 py-3 safe-top">
      <h1 className="text-[22px] font-semibold tracking-tight">Chi Tiêu</h1>
      <button
        type="button"
        onClick={onSettingsTap}
        className="bg-surface active:bg-surface2 flex size-8 items-center justify-center rounded-full transition-colors"
        aria-label="Cài đặt"
      >
        <Settings className="size-4 text-text-muted" />
      </button>
    </header>
  )
}
