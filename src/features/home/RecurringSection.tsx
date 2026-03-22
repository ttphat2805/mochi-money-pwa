import { formatShort } from '@/lib/utils'
import { RecurringRow } from './RecurringRow'
import type { RecurringItem } from '@/hooks/useHomeData'

interface RecurringSectionProps {
  items: RecurringItem[]
  onToggle: (item: RecurringItem) => void
  onGoToSettings: () => void
}

export function RecurringSection({ items, onToggle, onGoToSettings }: RecurringSectionProps) {
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
                  −{formatShort(doneTotal)}đ
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
        {items.length === 0 ? (
          <div className="py-8 flex flex-col items-center">
            <p className="text-2xl mb-2">🔁</p>
            <p className="text-[13px] text-text-muted mb-2">Chưa có khoản lặp lại hôm nay</p>
            <button
              type="button"
              onClick={onGoToSettings}
              className="text-[12px] text-accent font-medium"
            >
              Thêm trong Cài đặt →
            </button>
          </div>
        ) : (
          items.map((item, i) => (
            <RecurringRow
              key={item.template.id}
              item={item}
              onToggle={() => onToggle(item)}
              isLast={i === items.length - 1}
            />
          ))
        )}
      </div>
    </div>
  )
}
