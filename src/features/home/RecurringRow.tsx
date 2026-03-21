import { Check } from 'lucide-react'
import { formatVND } from '@/lib/utils'
import type { RecurringItem } from '@/hooks/useHomeData'

interface RecurringRowProps {
  item: RecurringItem
  onToggle: () => void
}

export function RecurringRow({ item, onToggle }: RecurringRowProps) {
  const { template, category, isDone } = item

  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex min-h-[52px] w-full items-center gap-3 px-4 py-3 text-left active:bg-surface transition-colors rounded-xl"
    >
      {/* Checkbox */}
      <div
        className={`flex size-[22px] shrink-0 items-center justify-center rounded-[7px] border transition-all ${
          isDone
            ? 'border-success bg-success'
            : 'border-border2'
        }`}
      >
        {isDone && <Check className="size-3.5 text-white" strokeWidth={2.5} />}
      </div>

      {/* Name + category */}
      <div className="min-w-0 flex-1">
        <p className={`truncate text-[13px] font-medium ${isDone ? 'text-text-muted line-through' : 'text-text'}`}>
          {template.name}
        </p>
        {category && (
          <p className="font-num text-[11px] text-text-muted">
            {category.icon} {category.name}
          </p>
        )}
      </div>

      {/* Amount */}
      <span className={`font-num shrink-0 text-[14px] font-medium ${isDone ? 'text-success' : 'text-text-muted'}`}>
        −{formatVND(template.amount)}đ
      </span>
    </button>
  )
}
