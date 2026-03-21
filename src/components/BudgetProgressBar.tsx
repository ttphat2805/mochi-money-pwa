import { useEffect, useRef } from 'react'
import { getBudgetStatus, BUDGET_STATUS_COLORS } from '@/types'

interface BudgetProgressBarProps {
  spent: number
  limit: number | null
  showLabel?: boolean
  height?: number
}

export function BudgetProgressBar({ spent, limit, showLabel = false, height = 4 }: BudgetProgressBarProps) {
  if (!limit) return null

  const pct = Math.min(1, spent / limit)
  const status = getBudgetStatus(spent, limit)
  const color = BUDGET_STATUS_COLORS[status]

  const barRef = useRef<HTMLDivElement>(null)

  // Animate from 0 to actual width on mount
  useEffect(() => {
    const bar = barRef.current
    if (!bar) return
    bar.style.width = '0%'
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.width = `${pct * 100}%`
      })
    })
  }, [pct])

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1 flex justify-between text-[10px]" style={{ color }}>
          <span className="font-num">
            {new Intl.NumberFormat('vi-VN').format(spent)}đ
          </span>
          <span className="text-text-hint font-num">
            / {new Intl.NumberFormat('vi-VN').format(limit)}đ
          </span>
        </div>
      )}
      <div
        className="w-full overflow-hidden rounded-full bg-surface2"
        style={{ height }}
      >
        <div
          ref={barRef}
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: '0%', backgroundColor: color }}
        />
      </div>
    </div>
  )
}
