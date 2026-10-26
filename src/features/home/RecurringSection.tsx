import { AlarmClock } from 'lucide-react'
import { formatShort } from '@/lib/utils'
import { RecurringRow } from './RecurringRow'
import type { RecurringItem } from '@/hooks/useHomeData'

interface RecurringSectionProps {
  items: RecurringItem[]
  onToggle: (item: RecurringItem) => void
  hasAnyRecurring: boolean
  onSettingsTap: () => void
}

export function RecurringSection({ items, onToggle, hasAnyRecurring, onSettingsTap }: RecurringSectionProps) {
  if (items.length === 0 && hasAnyRecurring) return null

  if (!hasAnyRecurring) {
    return (
      <div className="px-4">
        <button
          type="button"
          onClick={onSettingsTap}
          className="w-full glass rounded-[24px] p-4 text-left flex items-center justify-between active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="size-11 bg-accent/15 rounded-[14px] flex items-center justify-center">
              <AlarmClock size={20} className="text-accent-dark" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-text">Thêm khoản lặp lại</p>
              <p className="text-[12px] text-text-muted font-medium">Để app tự nhắc mỗi sáng</p>
            </div>
          </div>
          <div className="size-8 rounded-full bg-white/6 flex items-center justify-center text-accent-dark">→</div>
        </button>
      </div>
    )
  }

  const doneCount = items.filter((i) => i.isDone).length
  const doneTotal = items
    .filter((i) => i.isDone)
    .reduce((s, i) => s + i.template.amount, 0)

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-3">
        <p className="section-title">Hôm nay cần xác nhận</p>
        {items.length > 0 && (
          <p className="text-[11px] font-num text-text-muted px-2 h-6 flex items-center rounded-full bg-white/6">
            {doneCount}/{items.length}
            {doneTotal > 0 && (
              <>
                {' '}·{' '}
                <span className="text-success font-semibold">
                  −{formatShort(doneTotal)}
                </span>
              </>
            )}
          </p>
        )}
      </div>

      <div className="glass rounded-[24px] overflow-hidden">
        {items.map((item, i) => (
          <RecurringRow
            key={item.template.id}
            item={item}
            onToggle={() => onToggle(item)}
            isLast={i === items.length - 1}
          />
        ))}
      </div>
    </div>
  )
}
