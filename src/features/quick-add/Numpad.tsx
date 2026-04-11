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
    <div
      className="grid grid-cols-3 gap-3 w-full"
    >
      {KEYS.map((digit) => (
        <motion.button
          key={digit}
          type="button"
          whileTap={{ scale: 0.94, backgroundColor: 'var(--color-surface2)' }}
          onClick={() => { triggerHaptic('light'); onDigit(digit); }}
          className="bg-white border border-border/30 shadow-sm flex h-[58px] items-center justify-center rounded-2xl text-[24px] font-bold text-text active:shadow-inner transition-all"
        >
          {digit}
        </motion.button>
      ))}

      {/* Bottom row: backspace, 0, save */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.94, backgroundColor: 'rgba(0,0,0,0.05)' }}
        onClick={() => { triggerHaptic('light'); onDelete(); }}
        className="flex h-[58px] items-center justify-center rounded-2xl transition-colors"
        aria-label="Xóa"
      >
        <Delete className="text-text-muted size-6" />
      </motion.button>

      <motion.button
        type="button"
        whileTap={{ scale: 0.94, backgroundColor: 'var(--color-surface2)' }}
        onClick={() => { triggerHaptic('light'); onDigit(0); }}
        className="bg-white border border-border/30 shadow-sm flex h-[58px] items-center justify-center rounded-2xl text-[24px] font-bold text-text active:shadow-inner transition-all"
      >
        0
      </motion.button>

      <motion.button
        type="button"
        whileTap={canConfirm && !isSaving ? { scale: 0.94 } : {}}
        onClick={() => { triggerHaptic('medium'); onConfirm(); }}
        disabled={!canConfirm || isSaving}
        style={{ 
            backgroundColor: canConfirm ? accent : '#D0CEC4',
            boxShadow: canConfirm ? `0 8px 20px -6px ${accent}60` : 'none'
        }}
        className={`text-white flex h-[58px] items-center justify-center rounded-2xl text-[16px] font-black transition-all duration-300 disabled:opacity-40`}
      >
        {isSaving ? (
          <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : 'Xong'}
      </motion.button>
    </div>
  )
}
