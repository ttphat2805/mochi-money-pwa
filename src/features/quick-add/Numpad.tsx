import { Delete } from 'lucide-react'
import { triggerHaptic } from '@/lib/haptic'
import { motion } from 'framer-motion'
import { usePersonalization } from '@/hooks/usePersonalization'

interface NumpadProps {
  onDigit: (digit: number) => void
  onDelete: () => void
  onConfirm: () => void
  canConfirm: boolean
  isSaving: boolean
}

const KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

export function Numpad({ onDigit, onDelete, onConfirm, canConfirm, isSaving }: NumpadProps) {
  const { settings } = usePersonalization()
  const accent = settings.accentColor || '#E8A020'

  return (
    <div className="grid grid-cols-3 gap-2.5 w-full">
      {/* Digit keys 1–9 */}
      {KEYS.map((digit) => (
        <motion.button
          key={digit}
          type="button"
          whileTap={{ scale: 0.92, transition: { duration: 0.08 } }}
          onClick={() => { triggerHaptic('light'); onDigit(digit); }}
          className="bg-white shadow-sm flex h-[52px] items-center justify-center rounded-2xl text-[22px] font-bold text-text active:bg-white/70 transition-colors"
        >
          {digit}
        </motion.button>
      ))}

      {/* Backspace */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.92, transition: { duration: 0.08 } }}
        onClick={() => { triggerHaptic('light'); onDelete(); }}
        className="flex h-[52px] items-center justify-center rounded-2xl transition-colors active:bg-black/5"
        aria-label="Xóa"
      >
        <Delete className="text-black/40 size-5" />
      </motion.button>

      {/* Zero */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.92, transition: { duration: 0.08 } }}
        onClick={() => { triggerHaptic('light'); onDigit(0); }}
        className="bg-white shadow-sm flex h-[52px] items-center justify-center rounded-2xl text-[22px] font-bold text-text active:bg-white/70 transition-colors"
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
          backgroundColor: canConfirm ? accent : '#C0BDB5',
        }}
      >
        {isSaving ? (
          <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <span>Xong ✓</span>
        )}
      </motion.button>
    </div>
  )
}
