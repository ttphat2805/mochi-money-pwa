import { Delete } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AmountDisplayProps {
  display: string
  hasValue: boolean
  onClear?: () => void
}

export function AmountDisplay({ display, hasValue, onClear }: AmountDisplayProps) {
  return (
    <div className="flex flex-col items-center py-2 relative group w-full">      
      <div className="flex items-center justify-center relative w-full px-4 min-h-[80px]">
        {/* Main Amount Group with Pop Animation */}
        <AnimatePresence mode="popLayout">
          <motion.div 
            key={display}
            initial={{ scale: 0.9, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="flex items-baseline gap-1.5"
          >
            <span
              className={`font-num text-[56px] font-black leading-none tracking-[-3px] drop-shadow-sm transition-colors duration-300 ${
                hasValue ? 'text-text' : 'text-text-hint/30'
              }`}
            >
              {display}
            </span>
            <span className={`text-[24px] font-black transition-colors ${hasValue ? 'text-text-muted' : 'text-text-hint/20'}`}>
              đ
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Differentiated Clear Button (Using Delete icon) */}
        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute -right-2 top-1/2 -translate-y-1/2 size-8 rounded-full flex items-center justify-center bg-surface active:bg-surface2 transition-all border border-border/30"
            aria-label="Xóa số tiền"
          >
            <Delete size={14} className="text-text-hint" />
          </button>
        )}
      </div>
    </div>
  )
}
