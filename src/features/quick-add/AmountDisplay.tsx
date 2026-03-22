import { X } from 'lucide-react'

interface AmountDisplayProps {
  display: string
  hasValue: boolean
  onClear?: () => void
}

export function AmountDisplay({ display, hasValue, onClear }: AmountDisplayProps) {
  return (
    <div className="flex flex-col items-center py-2 relative">
      <span className="text-text-hint mb-1.5 text-[11px] font-medium uppercase tracking-[1.2px]">
        Số tiền
      </span>
      <div className="flex items-baseline">
        <span
          className={`font-num text-[44px] font-bold leading-none tracking-[-2px] transition-colors ${
            hasValue ? 'text-text' : 'text-text-hint'
          }`}
        >
          {display}
        </span>
        <span className="text-text-muted ml-0.5 text-lg">đ</span>
      </div>

      {/* Clear button — only when has value */}
      {hasValue && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: '#E8E6E0' }}
          aria-label="Xóa số tiền"
        >
          <X size={11} color="#88887A" />
        </button>
      )}
    </div>
  )
}
