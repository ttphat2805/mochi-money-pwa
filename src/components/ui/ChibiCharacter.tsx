import { motion } from 'framer-motion'
import * as React from 'react'

interface ChibiCharacterProps {
  mood: 'happy' | 'concerned' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: { width: 60, height: 60 },
  md: { width: 100, height: 100 },
  lg: { width: 140, height: 140 },
}

export const ChibiCharacter = React.memo(({
  mood,
  size = 'md',
  className = '',
}: ChibiCharacterProps) => {
  const dimensions = sizeMap[size]
  
  const moodEmoji = {
    happy: '✨',
    concerned: '💭',
    neutral: '🎉',
  }[mood]

  const imageSrc = {
    happy: '/chibi-piggy-happy.png',
    concerned: '/chibi-piggy-concerned.png',
    neutral: '/chibi-piggy-happy.png',
  }[mood]

  // Floating animation
  const floatVariants = {
    animate: {
      y: [0, -12, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  }

  // Bounce animation for happy mood
  const bounceVariants = {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatDelay: 1,
        ease: 'easeInOut' as const,
      },
    },
  }

  return (
    <motion.div
      variants={mood === 'happy' ? bounceVariants : floatVariants}
      animate="animate"
      className={`relative flex items-center justify-center ${className}`}
      style={dimensions}
    >
      <img
        src={imageSrc}
        alt={`Chibi character ${mood}`}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          filter: mood === 'concerned' ? 'drop-shadow(0 4px 12px rgba(220, 38, 38, 0.25))' : 'drop-shadow(0 4px 12px rgba(5, 150, 105, 0.25))',
        }}
        className="select-none pointer-events-none"
      />

      {/* Mood indicator bubble */}
      {mood !== 'neutral' && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 shadow-md border-2 border-accent"
          style={{
            borderColor: mood === 'happy' ? 'rgba(5, 150, 105, 0.6)' : 'rgba(220, 38, 38, 0.6)',
          }}
        >
          <span className="text-lg">{moodEmoji}</span>
        </motion.div>
      )}
    </motion.div>
  )
})

ChibiCharacter.displayName = 'ChibiCharacter'
