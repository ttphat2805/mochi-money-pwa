import { useState } from 'react'
import { formatVND } from '@/lib/utils'
import { CategoryIcon } from '@/lib/categoryIcons'
import type { RecurringItem } from '@/hooks/useHomeData'

interface RecurringRowProps {
  item: RecurringItem
  onToggle: () => void
  isLast?: boolean
}

export function RecurringRow({ item, onToggle, isLast }: RecurringRowProps) {
  const { template, category, isDone } = item
  const [bouncing, setBouncing] = useState(false)

  const handleToggle = () => {
    if (!isDone) setBouncing(true)
    setTimeout(() => setBouncing(false), 600)
    onToggle()
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-surface2 transition-colors"
      style={{
        borderBottom: isLast ? 'none' : '0.5px solid var(--color-border)',
      }}
    >
      {/* Animated checkbox */}
      <div
        className="shrink-0"
        style={{
          width: 24,
          height: 24,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDone ? 'var(--color-accent)' : 'transparent',
          border: isDone ? '2px solid var(--color-accent)' : '2px solid var(--color-text-hint)',
          transform: bouncing ? 'scale(1.2)' : 'scale(1)',
          transition: 'background 0.2s, border 0.2s, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {isDone && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Name + category */}
      <div className="flex-1 min-w-0">
        <p
          className="truncate text-[13.5px] font-medium transition-all duration-200"
          style={{
            color: isDone ? 'var(--color-text-hint)' : 'var(--color-text)',
            textDecoration: isDone ? 'line-through' : 'none',
          }}
        >
          {template.name}
        </p>
        {category && (
          <p className="font-num text-[11px] text-text-muted mt-0.5 flex items-center gap-1">
            <CategoryIcon icon={category.icon} size={12} color={category.color} className="text-text-muted" />
            {category.name}
          </p>
        )}
      </div>

      {/* Amount */}
      <span
        className="font-num shrink-0 text-[14px] font-semibold transition-colors duration-200"
        style={{ color: isDone ? 'var(--color-accent-dark)' : 'var(--color-text-muted)' }}
      >
        −{formatVND(template.amount)}đ
      </span>
    </button>
  )
}
