import { Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { usePersonalization } from '@/hooks/usePersonalization'

interface DateSelectorProps {
  dateLabel: string
  onTap: () => void
}

export function DateSelector({ dateLabel, onTap }: DateSelectorProps) {
  const { settings } = usePersonalization()
  const accent = settings.accentColor || '#E8A020'

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={onTap}
      className="flex shrink-0 items-center gap-1.5 px-3 py-2 rounded-xl bg-white/70 border border-border/20 transition-all"
    >
      <Calendar size={13} style={{ color: accent }} />
      <span className="text-[12px] font-bold text-text-muted whitespace-nowrap">{dateLabel}</span>
    </motion.button>
  )
}
