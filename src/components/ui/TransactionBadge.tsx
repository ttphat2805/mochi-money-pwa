import { motion } from 'framer-motion'
import * as React from 'react'

interface TransactionBadgeProps {
  category?: string
  isNew?: boolean
  className?: string
}

export const TransactionBadge = React.memo(({
  category,
  isNew = false,
  className = '',
}: TransactionBadgeProps) => {
  if (!isNew) return null

  const categoryEmoji: Record<string, string> = {
    housing: '🏠',
    utilities: '💡',
    food: '🍽️',
    shopping: '🛍️',
    transport: '🚗',
    health: '🏥',
    entertainment: '🎬',
    other: '📌',
  }

  const emoji = categoryEmoji[category?.toLowerCase() ?? 'other'] ?? '✨'

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent text-white text-xs font-bold shadow-md ${className}`}
    >
      {emoji}
    </motion.div>
  )
})

TransactionBadge.displayName = 'TransactionBadge'
