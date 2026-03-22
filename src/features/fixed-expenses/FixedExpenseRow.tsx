import { useRef, useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { formatVND } from '@/lib/utils'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import type { FixedExpense } from '@/types'

interface FixedExpenseRowProps {
  expense: FixedExpense
  onEdit: () => void
  onToggleActive: (active: boolean) => void
  onDelete: () => void
}

const SWIPE_OPEN = 80
const SWIPE_THRESHOLD = 40

export function FixedExpenseRow({ expense, onEdit, onToggleActive, onDelete }: FixedExpenseRowProps) {
  const [offsetX, setOffsetX] = useState(0)
  const touchStartX = useRef(0)
  const isDragging = useRef(false)

  const categories = useLiveQuery(() => db.categories.toArray())
  const category = categories?.find((c) => c.id === expense.categoryId)
  const displayIcon = category?.icon ?? '📦'
  const displayColor = category?.color ?? 'var(--color-accent)'

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    isDragging.current = false
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    isDragging.current = true
    const dx = e.touches[0].clientX - touchStartX.current
    if (dx < 0) {
      setOffsetX(Math.max(dx, -SWIPE_OPEN))
    } else if (offsetX < 0) {
      setOffsetX(Math.min(0, offsetX + dx * 0.5))
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging.current) return
    setOffsetX(Math.abs(offsetX) > SWIPE_THRESHOLD ? -SWIPE_OPEN : 0)
  }

  const handleRowTap = () => {
    if (offsetX !== 0) {
      setOffsetX(0)
      return
    }
    onEdit()
  }

  return (
    <div className="relative overflow-hidden">
      {/* Delete button underneath */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
        <button
          type="button"
          onClick={onDelete}
          className="bg-danger flex h-10 items-center rounded-xl px-4 text-[13px] font-semibold text-white"
        >
          Xóa
        </button>
      </div>

      {/* Swipeable row */}
      <div
        style={{ transform: `translateX(${offsetX}px)`, transition: isDragging.current ? 'none' : 'transform 0.2s' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleRowTap}
        className="bg-white flex min-h-[56px] cursor-pointer items-center gap-3 px-4 py-3 active:bg-surface"
      >
        {/* Icon */}
        <div 
          className="flex size-10 shrink-0 items-center justify-center rounded-xl text-xl leading-none"
          style={{ background: displayColor + '15' }}
        >
          {displayIcon}
        </div>

        {/* Name + schedule */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium">{expense.name}</p>
          <p className="font-num text-text-muted text-[11px]">
            Ngày {expense.payDay} hằng tháng {category ? `· ${category.name}` : ''}
          </p>
        </div>

        {/* Amount + toggle */}
        <div className="flex shrink-0 items-center gap-3">
          <span className={`font-num text-[13px] ${expense.active ? 'text-text-muted' : 'text-text-hint'}`}>
            −{formatVND(expense.amount)}đ
          </span>
          <Switch
            checked={expense.active}
            onCheckedChange={(checked) => onToggleActive(checked)}
            onClick={(e) => e.stopPropagation()}
            aria-label={expense.active ? 'Tắt' : 'Bật'}
          />
        </div>
      </div>
    </div>
  )
}
