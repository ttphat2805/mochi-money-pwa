import { Switch } from '@/components/ui/switch'
import { formatVND } from '@/lib/utils'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import type { FixedExpense } from '@/types'
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import { Trash } from 'lucide-react'
import { triggerHaptic } from '@/lib/haptic'

interface FixedExpenseRowProps {
  expense: FixedExpense
  onEdit: () => void
  onToggleActive: (active: boolean) => void
  onDelete: () => void
}

export function FixedExpenseRow({ expense, onEdit, onToggleActive, onDelete }: FixedExpenseRowProps) {
  const categories = useLiveQuery(() => db.categories.toArray())
  const category = categories?.find((c) => c.id === expense.categoryId)
  const displayIcon = category?.icon ?? '📦'
  const displayColor = category?.color ?? 'var(--color-accent)'

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
        {/* Icon */}
        <div 
          className="flex size-10 shrink-0 items-center justify-center rounded-xl text-xl leading-none"
          style={{ background: displayColor + '15' }}
        >
          {displayIcon}
        </div>

        {/* Name + schedule */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium text-text">{expense.name}</p>
          <p className="font-num text-text-muted text-[11px] truncate">
            Ngày {expense.payDay} hằng tháng {category ? `· ${category.name}` : ''}
          </p>
        </div>

        {/* Amount + toggle */}
        <div className="flex shrink-0 items-center gap-3">
          <span className={`font-num text-[13px] ${expense.active ? 'text-text-muted' : 'text-text-hint line-through'}`}>
            −{formatVND(expense.amount)}đ
          </span>
          <div onClick={(e) => e.stopPropagation()}>
            <Switch
              checked={expense.active}
              onCheckedChange={(checked) => {
                triggerHaptic('light')
                onToggleActive(checked)
              }}
              aria-label={expense.active ? 'Tắt' : 'Bật'}
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
