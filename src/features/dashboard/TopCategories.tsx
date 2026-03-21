import { formatVND } from '@/lib/utils'
import type { TopCategoryItem } from '@/hooks/useDashboard'

interface TopCategoriesProps {
  items: TopCategoryItem[]
}

export function TopCategories({ items }: TopCategoriesProps) {
  if (items.length === 0) {
    return (
      <p className="text-text-muted px-4 text-[13px]">Chưa có chi tiêu tháng này</p>
    )
  }

  return (
    <div className="flex flex-col gap-3 px-4">
      {items.map((item) => (
        <div key={item.category.id} className="flex items-center gap-3">
          <span className="text-[18px] leading-none">{item.category.icon}</span>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between">
              <span className="truncate text-[12px] font-medium">{item.category.name}</span>
              <span className="font-num text-text-muted ml-2 shrink-0 text-[11px]">
                {item.pct}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="bg-surface2 h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${item.pct}%`, backgroundColor: item.category.color }}
              />
            </div>
          </div>
          <span className="font-num text-text shrink-0 text-[12px] font-semibold">
            {formatVND(item.total)}đ
          </span>
        </div>
      ))}
    </div>
  )
}
