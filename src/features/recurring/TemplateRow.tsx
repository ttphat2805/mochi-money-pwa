import { formatVND } from '@/lib/utils'
import { scheduleLabel } from '@/hooks/useRecurring'
import type { RecurringTemplate, BudgetCategory } from '@/types'
import { Switch } from '@/components/ui/switch'
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
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
  const deleteOpacity = useTransform(x, [0, -60], [0, 1])
  const deleteBg = useTransform(x, [0, -80], ['#FEE2E2', '#EF4444'])

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -70) {
      triggerHaptic('heavy')
      onDelete()
    }
  }

  const handleRowTap = () => {
    if (x.get() > -10 && x.get() < 10) {
      onEdit()
    }
  }

  return (
    <div className="relative overflow-hidden w-full">
      {/* Background delete layer */}
      <motion.div 
        style={{ opacity: deleteOpacity, backgroundColor: deleteBg }}
        className="absolute inset-y-0 right-0 flex w-full items-center justify-end pr-5"
      >
        <Trash className="text-white size-5" />
      </motion.div>

      {/* Foreground swipable layer */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -90, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        onClick={handleRowTap}
        whileTap={{ scale: 0.98 }}
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
