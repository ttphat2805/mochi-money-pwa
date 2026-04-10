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
          className="w-full bg-accent/10 border border-accent/20 border-dashed rounded-[20px] p-4 text-left flex items-center justify-between active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 bg-accent/15 rounded-xl flex items-center justify-center text-lg">⏰</div>
            <div>
              <p className="text-[13px] font-bold text-accent">Thêm khoản lặp lại</p>
              <p className="text-[11px] text-accent/80 font-medium">Để app tự nhắc mỗi sáng</p>
            </div>
          </div>
          <div className="text-accent text-lg">→</div>
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
        <p className="text-[10px] font-bold tracking-widest text-text-hint uppercase">
          Hôm nay cần xác nhận
        </p>
        {items.length > 0 && (
          <p className="text-[11px] font-num text-text-muted">
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

      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{
          border: '1px solid #E8E6E0',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04), 0 1px 0 rgba(255,255,255,0.8) inset',
        }}
      >
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
