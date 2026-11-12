import { Check, Delete, History, Sparkles } from 'lucide-react'
import { triggerHaptic } from '@/lib/haptic'
import { motion } from 'framer-motion'
import { usePersonalization } from '@/hooks/usePersonalization'
import { tint } from '@/lib/utils'
import { formatSuggestionLabel, getAmountSuggestions } from './amountSuggestions'

interface NumpadProps {
  onDigit: (digit: number) => void
  onDelete: () => void
  onConfirm: () => void
  onShortcut?: (amount: number) => void
  /** Replaces the amount — enables smart suggestions (1 → 10K, 100K, 1tr) */
  onSetAmount?: (amount: number) => void
  /** Current amount — drives suggestions */
  amount?: number
  /** Amounts usually used for the selected category — shown while amount is 0 */
  frequentAmounts?: number[]
  /** Overrides the confirm button text (e.g. "Chọn danh mục") */
  confirmLabel?: string
  canConfirm: boolean
  isSaving: boolean
  isNote?: boolean
}

const KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const
const SHORTCUTS = [
  { label: '+50K', amount: 50000 },
  { label: '+100K', amount: 100000 },
  { label: '+200K', amount: 200000 },
  { label: '+500K', amount: 500000 },
]

const KEY_CLASS =
  'bg-card border border-border flex h-[46px] items-center justify-center rounded-2xl text-[22px] font-bold text-text active:bg-surface2 transition-colors'
const KEY_TAP = { scale: 0.92, transition: { duration: 0.08 } }
// `min-h-0` overrides the global 44px button min-height; the 40px row keeps the target large
const CHIP_BASE =
  'shrink-0 h-9 min-h-0 rounded-xl flex items-center border active:scale-90 transition-transform duration-75 touch-manipulation select-none'

export function Numpad({
  onDigit,
  onDelete,
  onConfirm,
  onShortcut,
  onSetAmount,
  amount = 0,
  frequentAmounts,
  confirmLabel,
  canConfirm,
  isSaving,
  isNote,
}: NumpadProps) {
  const { settings } = usePersonalization()
  const accent = isNote ? '#0EA5E9' : settings.accentColor

  // Chip priority: expand typed digits → usual amounts for this category → +K shortcuts
  const typedSuggestions = onSetAmount ? getAmountSuggestions(amount) : []
  const usualAmounts = onSetAmount && amount === 0 ? (frequentAmounts ?? []) : []
  const suggestions = typedSuggestions.length > 0 ? typedSuggestions : usualAmounts
  const SuggestionIcon = typedSuggestions.length > 0 ? Sparkles : History
  const showChipRow = Boolean(onSetAmount || onShortcut)
  const chipMode =
    typedSuggestions.length > 0 ? 'typed' : usualAmounts.length > 0 ? 'usual' : 'shortcut'

  const pressDigit = (digit: number) => {
    triggerHaptic('light')
    onDigit(digit)
  }

  // "000" — every form's appendDigit ignores leading zeros, so this is safe
  // to send as three zero presses (React batches the functional updates).
  const pressTripleZero = () => {
    triggerHaptic('light')
    onDigit(0)
    onDigit(0)
    onDigit(0)
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Chip row: smart suggestions while typing, quick shortcuts otherwise.
          Fixed height so swapping chips never shifts the keypad. */}
      {/* Chips are plain buttons keyed by slot, so typing only swaps their text
          (no unmount/remount). The row is keyed by mode, so the CSS fade runs
          only when switching between suggestions and shortcuts. */}
      {showChipRow && (
        <div
          key={chipMode}
          className="animate-chip-in h-10 py-0.5 flex items-center gap-1.5 overflow-x-auto overflow-y-hidden scrollbar-hide"
        >
          {chipMode !== 'shortcut'
            ? suggestions.map((value, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium')
                    onSetAmount?.(value)
                  }}
                  className={`${CHIP_BASE} px-3.5 gap-1.5 text-[13px] font-black`}
                  style={{
                    color: accent,
                    backgroundColor: tint(accent, 14),
                    borderColor: tint(accent, 35),
                  }}
                >
                  {i === 0 && <SuggestionIcon size={12} strokeWidth={2.5} />}
                  {formatSuggestionLabel(value)}
                </button>
              ))
            : onShortcut &&
              SHORTCUTS.map((s) => (
                <button
                  key={s.amount}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light')
                    onShortcut(s.amount)
                  }}
                  className={`${CHIP_BASE} px-3 bg-card text-[12px] font-bold text-text-muted active:bg-surface2 border-border`}
                >
                  {s.label}
                </button>
              ))}
        </div>
      )}

      {/* Digit grid */}
      <div className="grid grid-cols-3 gap-2 w-full">
        {KEYS.map((digit) => (
          <motion.button
            key={digit}
            type="button"
            whileTap={KEY_TAP}
            onClick={() => pressDigit(digit)}
            className={KEY_CLASS}
          >
            {digit}
          </motion.button>
        ))}

        <motion.button
          type="button"
          whileTap={KEY_TAP}
          onClick={pressTripleZero}
          className={`${KEY_CLASS} !text-[18px]`}
          aria-label="Thêm 000"
        >
          000
        </motion.button>

        <motion.button
          type="button"
          whileTap={KEY_TAP}
          onClick={() => pressDigit(0)}
          className={KEY_CLASS}
        >
          0
        </motion.button>

        <motion.button
          type="button"
          whileTap={KEY_TAP}
          onClick={() => { triggerHaptic('light'); onDelete(); }}
          className="flex h-[46px] items-center justify-center rounded-2xl transition-colors active:bg-white/5"
          aria-label="Xóa"
        >
          <Delete className="text-text-muted size-5" />
        </motion.button>
      </div>

      {/* Confirm — full width so the amount being saved is always visible */}
      <motion.button
        type="button"
        whileTap={canConfirm && !isSaving ? { scale: 0.97, transition: { duration: 0.08 } } : {}}
        onClick={() => { triggerHaptic('medium'); onConfirm(); }}
        disabled={!canConfirm || isSaving}
        className="flex h-[48px] w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-black transition-all duration-200 disabled:text-text-hint"
        style={{
          backgroundColor: canConfirm ? accent : 'var(--color-surface2)',
          color: canConfirm ? '#FFFFFF' : undefined,
          boxShadow: canConfirm ? `0 8px 24px ${tint(accent, 35)}` : 'none',
        }}
      >
        {isSaving ? (
          <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            {canConfirm && <Check size={18} strokeWidth={3} />}
            <span>{confirmLabel ?? 'Xong'}</span>
          </>
        )}
      </motion.button>
    </div>
  )
}
