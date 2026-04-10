import { motion, AnimatePresence } from 'framer-motion'

interface FloatingSuccessAnimationProps {
  isVisible: boolean
  amount: number
}

export function FloatingSuccessAnimation({ isVisible, amount }: FloatingSuccessAnimationProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 1, y: -80, scale: 1.2 }}
          exit={{ opacity: 0, y: -120, scale: 1 }}
          transition={{ 
            duration: 0.6, 
            ease: [0.16, 1, 0.3, 1] // Custom ease-out
          }}
          className="pointer-events-none fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1.5 rounded-[20px] bg-[#2A9D6E]/95 px-5 py-2.5 shadow-xl backdrop-blur-md border border-white/20"
        >
          <span className="text-white font-num font-bold text-[18px] tracking-wider">
            -{amount.toLocaleString('vi-VN')}đ
          </span>
          <motion.span 
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 15 }}
             className="text-[18px]"
          >
            ✨
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
