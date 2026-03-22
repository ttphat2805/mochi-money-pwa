import { ChevronRight, Loader2 } from 'lucide-react'

interface SettingsRowProps {
  icon: React.ReactNode
  label: string
  sublabel?: string
  onTap?: () => void
  rightSlot?: React.ReactNode
  danger?: boolean
  loading?: boolean
}

export function SettingsRow({ icon, label, sublabel, onTap, rightSlot, danger, loading }: SettingsRowProps) {
  const isClickable = !!onTap

  const content = (
    <>
      <span className="text-lg leading-none">{icon}</span>
      <div className="flex-1">
        <p className={`text-[14px] font-medium ${danger ? 'text-danger' : 'text-text'}`}>
          {label}
        </p>
        {sublabel && <p className="text-text-muted mt-0.5 text-[11px]">{sublabel}</p>}
      </div>
      {loading ? (
        <Loader2 className="text-text-hint size-4 animate-spin" />
      ) : (
        rightSlot ?? (onTap ? <ChevronRight className="text-text-hint size-4" /> : null)
      )}
    </>
  )

  const className = `flex min-h-[52px] w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
    isClickable ? 'active:bg-surface' : ''
  } disabled:opacity-60`

  if (isClickable) {
    return (
      <button
        type="button"
        onClick={onTap}
        disabled={loading}
        className={className}
      >
        {content}
      </button>
    )
  }

  return (
    <div className={className}>
      {content}
    </div>
  )
}
