import { Delete } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AmountDisplayProps {
  display: string
  hasValue: boolean
  onClear?: () => void
  /** Tighter height — gives the category list more room in Quick Add */
  compact?: boolean
}

// ── Font size steps by display length ("1.234.567" = 9 chars) so even
// 99.999.999.999đ fits a 375px screen without clipping.
function amountFontClass(length: number): string {
  if (length <= 7) return 'text-[52px] tracking-[-2.5px]'
  if (length <= 9) return 'text-[46px] tracking-[-2px]'
  if (length <= 11) return 'text-[40px] tracking-[-1.5px]'
  return 'text-[34px] tracking-[-1px]'
}

export function AmountDisplay({ display, hasValue, onClear, compact }: AmountDisplayProps) {
  return (
    <div className="flex flex-col items-center relative w-full">
      {/* Plain (non-keyed) text: updates in place on every key press — no
          remount + spring per digit, which made fast typing feel laggy */}
      <div
        className={cn(
          'flex items-center justify-center relative w-full px-10',
          compact ? 'min-h-[64px]' : 'min-h-[80px]',
        )}
      >
        <div className="flex items-baseline gap-1.5 min-w-0">
          <span
            className={cn(
              'font-num font-black leading-none drop-shadow-sm transition-colors duration-300 whitespace-nowrap',
              amountFontClass(display.length),
              hasValue ? 'text-text' : 'text-text-hint/30',
            )}
          >
            {display}
          </span>
          <span
            className={cn(
              'text-[22px] font-black transition-colors',
              hasValue ? 'text-text-muted' : 'text-text-hint/20',
            )}
          >
            đ
          </span>
        </div>

        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="!min-h-0 absolute right-0 top-1/2 -translate-y-1/2 size-11 rounded-full flex items-center justify-center active:bg-surface2 transition-colors"
            aria-label="Xóa số tiền"
          >
            <span className="size-8 rounded-full flex items-center justify-center bg-surface border border-border/30">
              <Delete size={14} className="text-text-hint" />
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
