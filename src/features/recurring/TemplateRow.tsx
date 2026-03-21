import { useRef, useState } from 'react'
import { formatVND } from '@/lib/utils'
import { scheduleLabel } from '@/hooks/useRecurring'
import type { RecurringTemplate, BudgetCategory } from '@/types'
import { Switch } from '@/components/ui/switch'

interface TemplateRowProps {
  template: RecurringTemplate
  category: BudgetCategory | undefined
  onEdit: () => void
  onToggleActive: (active: boolean) => void
  onDelete: () => void
}

const SWIPE_OPEN = 80
const SWIPE_THRESHOLD = 40

export function TemplateRow({ template, category, onEdit, onToggleActive, onDelete }: TemplateRowProps) {
  const [offsetX, setOffsetX] = useState(0)
  const touchStartX = useRef(0)
  const isDragging = useRef(false)

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
      setOffsetX(0) // close swipe first
      return
    }
    onEdit()
  }

  return (
    <div className="relative overflow-hidden">
      {/* Delete button revealed underneath */}
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
        {/* Category emoji */}
        <span className="text-xl leading-none shrink-0">{category?.icon ?? '📦'}</span>

        {/* Name + schedule + category */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium">{template.name}</p>
          <p className="font-num text-text-muted text-[11px]">
            {scheduleLabel(template.schedule)} · {category?.name ?? '—'}
          </p>
        </div>

        {/* Amount + active toggle */}
        <div className="flex shrink-0 items-center gap-3">
          <span className="font-num text-[13px] text-text-muted">
            −{formatVND(template.amount)}đ
          </span>

          {/* Toggle switch */}
          <Switch
            checked={template.active}
            onCheckedChange={(checked) => onToggleActive(checked)}
            onClick={(e) => e.stopPropagation()}
            aria-label={template.active ? 'Tắt' : 'Bật'}
          />
        </div>
      </div>
    </div>
  )
}
