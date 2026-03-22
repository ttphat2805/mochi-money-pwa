import { useState } from 'react'
import { formatVND } from '@/lib/utils'
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
    setBouncing(true)
    setTimeout(() => setBouncing(false), 280)
    onToggle()
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-surface transition-colors"
      style={{
        borderBottom: isLast ? 'none' : '0.5px solid #F0EDE8',
      }}
    >
      {/* Animated checkbox */}
      <div
        className="shrink-0 transition-all duration-200"
        style={{
          width: 24,
          height: 24,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDone ? '#2A9D6E' : 'transparent',
          border: isDone ? '2px solid #2A9D6E' : '2px solid #D0CEC6',
          transform: bouncing ? 'scale(0.82)' : 'scale(1)',
          transition: 'background 0.18s, border 0.18s, transform 0.18s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
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
            color: isDone ? '#B8B8A8' : '#1A1A18',
            textDecoration: isDone ? 'line-through' : 'none',
          }}
        >
          {template.name}
        </p>
        {category && (
          <p className="font-num text-[11px] text-text-muted mt-0.5">
            {category.icon} {category.name}
          </p>
        )}
      </div>

      {/* Amount */}
      <span
        className="font-num shrink-0 text-[14px] font-semibold transition-colors duration-200"
        style={{ color: isDone ? '#2A9D6E' : '#88887A' }}
      >
        −{formatVND(template.amount)}đ
      </span>
    </button>
  )
}
