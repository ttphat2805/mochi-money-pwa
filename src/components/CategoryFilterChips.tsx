import { CategoryIcon } from '@/components/CategoryIcon'
import { triggerHaptic } from '@/lib/haptic'
import { cn } from '@/lib/utils'
import type { BudgetCategory } from '@/types'
import { motion } from 'framer-motion'
import * as React from 'react'

interface CategoryFilterChipsProps {
  categories: BudgetCategory[]
  selectedId: number | null
  onSelect: (id: number | null) => void
  /** Gradient start class for the edge fades — must match the page background */
  fadeFrom?: string
  className?: string
}

/**
 * Compact, borderless category filter row.
 * A single dark pill springs between chips (framer layoutId) — chips
 * themselves never change size, so the row stays perfectly stable.
 */
export function CategoryFilterChips({
  categories,
  selectedId,
  onSelect,
  fadeFrom = 'from-bg',
  className,
}: CategoryFilterChipsProps) {
  const pillId = React.useId()
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const chipRefs = React.useRef(new Map<string, HTMLButtonElement>())

  const activeKey = selectedId == null ? 'all' : String(selectedId)

  // Keep the selected chip centered in view
  React.useEffect(() => {
    const scroller = scrollerRef.current
    const chip = chipRefs.current.get(activeKey)
    if (!scroller || !chip) return
    const target = chip.offsetLeft - (scroller.clientWidth - chip.offsetWidth) / 2
    scroller.scrollTo({ left: Math.max(0, target), behavior: 'smooth' })
  }, [activeKey, categories.length])

  const registerChip = (key: string) => (el: HTMLButtonElement | null) => {
    if (el) chipRefs.current.set(key, el)
    else chipRefs.current.delete(key)
  }

  const handleSelect = (id: number | null) => {
    triggerHaptic('light')
    onSelect(id)
  }

  return (
    <div className={cn('relative', className)}>
      <div className={cn('pointer-events-none absolute inset-y-0 left-0 z-10 w-5 bg-linear-to-r to-transparent', fadeFrom)} />
      <div className={cn('pointer-events-none absolute inset-y-0 right-0 z-10 w-5 bg-linear-to-l to-transparent', fadeFrom)} />

      <div
        ref={scrollerRef}
        className="flex items-center gap-1.5 overflow-x-auto px-4 py-1 scrollbar-hide touch-pan-x"
        style={{ WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain' }}
      >
        <Chip
          chipRef={registerChip('all')}
          pillId={pillId}
          isActive={selectedId == null}
          onClick={() => handleSelect(null)}
          label="Tất cả"
        />

        {categories.map((cat) => {
          const isActive = selectedId === cat.id
          return (
            <Chip
              key={cat.id}
              chipRef={registerChip(String(cat.id))}
              pillId={pillId}
              isActive={isActive}
              onClick={() => handleSelect(isActive ? null : cat.id!)}
              icon={cat.icon}
              label={cat.name}
            />
          )
        })}
      </div>
    </div>
  )
}

function Chip({
  chipRef,
  pillId,
  isActive,
  onClick,
  icon,
  label,
}: {
  chipRef: (el: HTMLButtonElement | null) => void
  pillId: string
  isActive: boolean
  onClick: () => void
  icon?: string
  label: string
}) {
  return (
    <motion.button
      ref={chipRef}
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      aria-pressed={isActive}
      className={cn(
        'relative snap-start shrink-0 flex h-8 items-center gap-1.5 rounded-full px-3.5 transition-colors duration-200',
        // Invisible vertical padding so the touch target reaches 44px
        'after:absolute after:-inset-y-2.5 after:inset-x-0 after:content-[""]',
        // Inverted pill: near-white fill + navy text on the dark theme
        isActive ? 'text-bg' : 'bg-surface2/60 text-text-muted',
      )}
      style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
    >
      {isActive && (
        <motion.span
          layoutId={pillId}
          className="absolute inset-0 rounded-full bg-text shadow-sm"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
        />
      )}
      {icon && (
        <CategoryIcon icon={icon} size={14} className="relative z-10" />
      )}
      <span className="relative z-10 whitespace-nowrap text-[12px] font-semibold tracking-tight">
        {label}
      </span>
    </motion.button>
  )
}
