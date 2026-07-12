import { Delete } from 'lucide-react'
import { triggerHaptic } from '@/lib/haptic'
import { motion } from 'framer-motion'
import { usePersonalization } from '@/hooks/usePersonalization'

interface NumpadProps {
  onDigit: (digit: number) => void
  onDelete: () => void
  onConfirm: () => void
  onShortcut?: (amount: number) => void
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

export function Numpad({ onDigit, onDelete, onConfirm, onShortcut, canConfirm, isSaving, isNote }: NumpadProps) {
  const { settings } = usePersonalization()
  const accent = isNote ? '#0EA5E9' : settings.accentColor

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Quick amount shortcut chips */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
        {SHORTCUTS.map((s) => (
          <motion.button
            key={s.amount}
            type="button"
            whileTap={{ scale: 0.9, transition: { duration: 0.08 } }}
          onClick={() => { triggerHaptic('light'); onShortcut?.(s.amount); }}
            className="shrink-0 h-8 px-3 rounded-xl bg-card shadow-sm text-[12px] font-bold text-text-muted active:bg-surface2 border border-border"
          >
            {s.label}
          </motion.button>
        ))}
      </div>
      {/* Digit grid */}
      <div className="grid grid-cols-3 gap-2.5 w-full">
        {/* Digit keys 1–9 */}
        {KEYS.map((digit) => (
          <motion.button
            key={digit}
            type="button"
            whileTap={{ scale: 0.92, transition: { duration: 0.08 } }}
            onClick={() => { triggerHaptic('light'); onDigit(digit); }}
            className="bg-card shadow-sm flex h-[52px] items-center justify-center rounded-2xl text-[22px] font-bold text-text active:bg-surface2 transition-colors"
          >
            {digit}
          </motion.button>
        ))}

        {/* Backspace */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.92, transition: { duration: 0.08 } }}
          onClick={() => { triggerHaptic('light'); onDelete(); }}
          className="flex h-[52px] items-center justify-center rounded-2xl transition-colors active:bg-white/5"
          aria-label="Xóa"
        >
          <Delete className="text-text-muted size-5" />
        </motion.button>

        {/* Zero */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.92, transition: { duration: 0.08 } }}
          onClick={() => { triggerHaptic('light'); onDigit(0); }}
          className="bg-card shadow-sm flex h-[52px] items-center justify-center rounded-2xl text-[22px] font-bold text-text active:bg-surface2 transition-colors"
        >
          0
        </motion.button>

        {/* Confirm / Done — spans prominently */}
        <motion.button
          type="button"
          whileTap={canConfirm && !isSaving ? { scale: 0.94, transition: { duration: 0.08 } } : {}}
          onClick={() => { triggerHaptic('medium'); onConfirm(); }}
          disabled={!canConfirm || isSaving}
          className="flex h-[52px] items-center justify-center rounded-2xl text-[15px] font-black text-white transition-all duration-200 disabled:opacity-35"
          style={{
            backgroundColor: canConfirm ? accent : 'var(--color-surface2)',
          }}
        >
          {isSaving ? (
            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span>Xong ✓</span>
          )}
        </motion.button>
      </div>
    </div>
  )
}
