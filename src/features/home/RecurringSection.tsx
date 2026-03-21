import type { RecurringItem } from '@/hooks/useHomeData'
import { RecurringRow } from './RecurringRow'

interface RecurringSectionProps {
  items: RecurringItem[]
  onToggle: (item: RecurringItem) => void
  onGoToSettings: () => void
}

export function RecurringSection({ items, onToggle, onGoToSettings }: RecurringSectionProps) {
  return (
    <div>
      <div className="px-5 pb-1.5">
        <span className="text-text-hint text-[10px] font-medium uppercase tracking-[1.2px]">
          Hôm nay
        </span>
      </div>

      {items.length === 0 ? (
        <button
          type="button"
          onClick={onGoToSettings}
          className="bg-surface mx-4 w-[calc(100%-32px)] rounded-xl p-4 text-left transition-colors active:bg-surface2"
        >
          <p className="text-[13px] font-medium">Chưa có khoản lặp lại</p>
          <p className="text-text-muted mt-0.5 text-[12px]">
            Thêm trong Cài đặt để app tự nhắc hằng ngày →
          </p>
        </button>
      ) : (
        <div className="mx-2 flex flex-col">
          {items.map((item) => (
            <RecurringRow
              key={item.template.id}
              item={item}
              onToggle={() => onToggle(item)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
