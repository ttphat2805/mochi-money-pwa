import * as React from 'react'
import { formatVND } from '@/lib/utils'
import { scheduleLabel } from '@/hooks/useRecurring'
import type { RecurringTemplate, BudgetCategory } from '@/types'
import { Switch } from '@/components/ui/switch'
import { motion, useMotionValue, animate, type PanInfo } from 'framer-motion'
import { Trash } from 'lucide-react'
import { triggerHaptic } from '@/lib/haptic'

interface TemplateRowProps {
  template: RecurringTemplate
  category: BudgetCategory | undefined
  onEdit: () => void
  onToggleActive: (active: boolean) => void
  onDelete: () => void
}

export function TemplateRow({ template, category, onEdit, onToggleActive, onDelete }: TemplateRowProps) {
  const x = useMotionValue(0)
  const [hasDragged, setHasDragged] = React.useState(false)

  const handleRowTap = (e: React.MouseEvent) => {
    if (hasDragged) return
    if (Math.abs(x.get()) > 5) {
      animate(x, 0, { type: 'spring', bounce: 0, duration: 0.3 })
      e.preventDefault()
      return
    }
    onEdit()
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    triggerHaptic('heavy')
    onDelete()
  }

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 10) {
      setHasDragged(true)
      setTimeout(() => setHasDragged(false), 50)
    }

    if (info.offset.x < -20 || info.point.x < -20) {
      animate(x, -64, { type: 'spring', bounce: 0.2, duration: 0.3 })
    } else {
      animate(x, 0, { type: 'spring', bounce: 0.2, duration: 0.3 })
    }
  }

  return (
    <div className="relative overflow-hidden w-full bg-[#EF4444]">
      {/* Background delete button layer */}
      <div className="absolute inset-y-0 right-0 w-[64px] flex items-center justify-center">
        <button
          type="button"
          onClick={handleDelete}
          className="w-full h-full flex items-center justify-center text-white active:opacity-70 transition-opacity"
        >
          <Trash className="size-5" />
        </button>
      </div>

      {/* Foreground swipable layer */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -64, right: 0 }}
        dragElastic={0.05}
        style={{ x }}
        onDragEnd={handleDragEnd}
        onClick={handleRowTap}
        whileTap={{ scale: Math.abs(x.get()) < 5 ? 0.98 : 1 }}
        className="bg-white relative z-10 flex cursor-grab min-h-[56px] items-center gap-3 px-4 py-3 active:bg-surface active:cursor-grabbing w-full"
      >
        {/* Category emoji */}
        <span className="text-xl leading-none shrink-0">{category?.icon ?? '📦'}</span>

        {/* Name + schedule + category */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium text-text">{template.name}</p>
          <p className="font-num text-text-muted text-[11px] truncate">
            {scheduleLabel(template.schedule)} · {category?.name ?? '—'}
          </p>
        </div>

        {/* Amount + active toggle */}
        <div className="flex shrink-0 items-center gap-3">
          <span className={`font-num text-[13px] ${template.active ? 'text-text-muted' : 'text-text-hint line-through'}`}>
            −{formatVND(template.amount)}đ
          </span>

          {/* Toggle switch */}
          <div onClick={(e) => e.stopPropagation()}>
            <Switch
              checked={template.active}
              onCheckedChange={(checked) => {
                triggerHaptic('light')
                onToggleActive(checked)
              }}
              aria-label={template.active ? 'Tắt' : 'Bật'}
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
