import { Delete } from 'lucide-react'
import { triggerHaptic } from '@/lib/haptic'
import { motion } from 'framer-motion'

interface NumpadProps {
  onDigit: (digit: number) => void
  onDelete: () => void
  onConfirm: () => void
  canConfirm: boolean
  isSaving: boolean
}

const KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

export function Numpad({ onDigit, onDelete, onConfirm, canConfirm, isSaving }: NumpadProps) {
  return (
    <div
      className="grid grid-cols-3 gap-2 px-5"
      style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}
    >
      {KEYS.map((digit) => (
        <motion.button
          key={digit}
          type="button"
          whileTap={{ scale: 0.95, backgroundColor: 'var(--color-surface2)' }}
          onClick={() => { triggerHaptic('light'); onDigit(digit); }}
          className="bg-white border border-border/40 shadow-sm flex h-[64px] items-center justify-center rounded-2xl text-[22px] font-semibold text-text"
        >
          {digit}
        </motion.button>
      ))}

      {/* Bottom row: backspace, 0, save */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.95, backgroundColor: 'rgba(0,0,0,0.05)' }}
        onClick={() => { triggerHaptic('light'); onDelete(); }}
        className="flex h-[64px] items-center justify-center rounded-2xl"
        aria-label="Xóa"
      >
        <Delete className="text-text-muted size-6" />
      </motion.button>

      <motion.button
        type="button"
        whileTap={{ scale: 0.95, backgroundColor: 'var(--color-surface2)' }}
        onClick={() => { triggerHaptic('light'); onDigit(0); }}
        className="bg-white border border-border/40 shadow-sm flex h-[64px] items-center justify-center rounded-2xl text-[22px] font-semibold text-text"
      >
        0
      </motion.button>

      <motion.button
        type="button"
        whileTap={canConfirm && !isSaving ? { scale: 0.95 } : {}}
        onClick={() => { triggerHaptic('medium'); onConfirm(); }}
        disabled={!canConfirm || isSaving}
        className={`bg-text text-white shadow-md flex h-[64px] items-center justify-center rounded-2xl text-[15px] font-bold transition-opacity duration-200 disabled:opacity-20 ${
          canConfirm && !isSaving ? 'animate-ready-pulse' : ''
        }`}
      >
        {isSaving ? '...' : 'Xong'}
      </motion.button>
    </div>
  )
}

