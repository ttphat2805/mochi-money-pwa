import { X } from 'lucide-react'

interface AmountDisplayProps {
  display: string
  hasValue: boolean
  onClear?: () => void
}

export function AmountDisplay({ display, hasValue, onClear }: AmountDisplayProps) {
  return (
    <div className="flex flex-col items-center py-4 relative group">
      <span className="text-text-hint mb-3 text-[10px] font-semibold uppercase tracking-[2px] opacity-70">
        Số tiền
      </span>
      
      <div className="flex items-center justify-center relative w-full px-10 min-h-[64px]">
        {/* Main Amount Group */}
        <div className="flex items-baseline gap-1 animate-in zoom-in-95 duration-200">
          <span
            className={`font-num text-[48px] font-bold leading-none tracking-[-2.5px] transition-all drop-shadow-sm ${
              hasValue ? 'text-text scale-105' : 'text-text-hint/40'
            }`}
          >
            {display}
          </span>
          <span className={`text-[20px] font-medium transition-colors ${hasValue ? 'text-text-muted' : 'text-text-hint/30'}`}>
            đ
          </span>
        </div>

        {/* Clear button — sophisticated positioning */}
        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-4 w-7 h-7 rounded-lg flex items-center justify-center bg-white shadow-sm border border-border/50 active:scale-90 transition-all hover:bg-white hover:shadow-md"
            aria-label="Xóa số tiền"
          >
            <X size={12} className="text-text-muted" />
          </button>
        )}
      </div>

      {/* Decorative line */}
      <div className="mt-4 w-12 h-0.5 rounded-full bg-border/40" />
    </div>
  )
}
