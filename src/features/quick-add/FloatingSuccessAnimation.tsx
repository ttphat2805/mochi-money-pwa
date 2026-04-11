import { motion, AnimatePresence } from 'framer-motion'

interface FloatingSuccessAnimationProps {
  isVisible: boolean
  amount: number
}

// Spring configuration for a satisfying "pop"
const POP_SPRING = {
  type: "spring",
  stiffness: 400,
  damping: 25,
  mass: 1.2
} as const

export function FloatingSuccessAnimation({ isVisible, amount }: FloatingSuccessAnimationProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.6 }}
          animate={{ opacity: 1, y: -90, scale: 1 }}
          exit={{ opacity: 0, y: -130, scale: 0.9, filter: 'blur(4px)' }}
          transition={POP_SPRING}
          className="pointer-events-none fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 rounded-full bg-[#1A1A18] px-6 py-3.5 shadow-2xl backdrop-blur-xl border border-white/10"
        >
          <motion.div 
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 15 }}
            className="flex items-center justify-center size-7 rounded-full bg-success/20 text-success text-[14px]"
          >
            ✓
          </motion.div>
          <span className="text-white font-num font-black text-[18px] tracking-tight">
             -{amount.toLocaleString('vi-VN')}đ
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
