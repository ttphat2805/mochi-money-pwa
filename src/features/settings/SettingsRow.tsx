import { ChevronRight } from 'lucide-react'

interface SettingsRowProps {
  icon: React.ReactNode
  label: string
  sublabel?: string
  onTap?: () => void
  rightSlot?: React.ReactNode
  danger?: boolean
}

export function SettingsRow({ icon, label, sublabel, onTap, rightSlot, danger }: SettingsRowProps) {
  return (
    <button
      type="button"
      onClick={onTap}
      disabled={!onTap && !rightSlot}
      className={`flex min-h-[52px] w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
        onTap ? 'active:bg-surface' : ''
      } disabled:opacity-100`}
    >
      <span className="text-lg leading-none">{icon}</span>
      <div className="flex-1">
        <p className={`text-[14px] font-medium ${danger ? 'text-danger' : 'text-text'}`}>
          {label}
        </p>
        {sublabel && <p className="text-text-muted mt-0.5 text-[11px]">{sublabel}</p>}
      </div>
      {rightSlot ?? (onTap ? <ChevronRight className="text-text-hint size-4" /> : null)}
    </button>
  )
}
