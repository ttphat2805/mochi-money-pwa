import { motion, AnimatePresence } from 'framer-motion'
import * as React from 'react'

interface CelebrationBurstProps {
  trigger: boolean
  type?: 'success' | 'milestone' | 'gentle'
}

export const CelebrationBurst = React.memo(({
  trigger,
  type = 'gentle',
}: CelebrationBurstProps) => {
  const particleCount = type === 'gentle' ? 6 : 12
  const duration = type === 'gentle' ? 1.5 : 2

  return (
    <AnimatePresence>
      {trigger && (
        <>
          {Array.from({ length: particleCount }).map((_, i) => {
            const angle = (i / particleCount) * Math.PI * 2
            const distance = type === 'gentle' ? 80 : 120
            const endX = Math.cos(angle) * distance
            const endY = Math.sin(angle) * distance

            const particles = {
              success: ['🎉', '✨', '🎊', '💚', '🌟'],
              milestone: ['🏆', '⭐', '🎯', '💫', '🌈'],
              gentle: ['✨', '💚', '🌟', '💫'],
            }

            const particle = particles[type][i % particles[type].length]

            return (
              <motion.div
                key={`burst-${type}-${i}`}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: endX,
                  y: endY,
                  opacity: 0,
                  scale: 0,
                  rotate: Math.random() * 360,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration,
                  ease: 'easeOut',
                  delay: Math.random() * 0.1,
                }}
                className="fixed pointer-events-none text-xl"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {particle}
              </motion.div>
            )
          })}
        </>
      )}
    </AnimatePresence>
  )
})

CelebrationBurst.displayName = 'CelebrationBurst'
