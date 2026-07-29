import { Plus } from 'lucide-react'
import { triggerHaptic } from '@/lib/haptic'
import { motion } from 'framer-motion'

interface FABProps {
  onClick: () => void
}

export function FAB({ onClick }: FABProps) {
  return (
    <motion.button
      type="button"
      onClick={() => {
        triggerHaptic('medium')
        onClick()
      }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="bg-accent fixed right-5 z-50 flex size-14 items-center justify-center rounded-full text-white"
      style={{
        bottom: 'calc(76px + env(safe-area-inset-bottom))',
        boxShadow: `0 6px 24px rgba(var(--color-accent-rgb), 0.4)`,
      }}
      aria-label="Thêm chi tiêu"
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Plus className="size-7 text-white" strokeWidth={2.5} />
      </motion.div>
    </motion.button>
  )
}
