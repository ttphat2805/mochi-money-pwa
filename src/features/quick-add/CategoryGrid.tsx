import type { BudgetCategory } from '@/types'

interface CategoryGridProps {
  categories: BudgetCategory[]
  selectedId: number | null
  onSelect: (id: number) => void
}

export function CategoryGrid({ categories, selectedId, onSelect }: CategoryGridProps) {
  if (categories.length === 0) {
    return (
      <div className="text-text-muted py-4 text-center text-sm">
        Chưa có danh mục nào
      </div>
    )
  }

  return (
    <div className="max-h-[160px] overflow-y-auto px-4">
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: '1fr 1fr' }}
      >
        {categories.map((category) => {
          const isSelected = category.id === selectedId
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => category.id != null && onSelect(category.id)}
              className={`flex h-11 items-center gap-2 rounded-[10px] border px-3 text-left transition-all ${
                isSelected
                  ? 'border-accent bg-accent-bg'
                  : 'border-border bg-white active:bg-surface'
              }`}
            >
              <span className="text-xl leading-none shrink-0">{category.icon}</span>
              <span
                className={`truncate text-[13px] font-medium ${
                  isSelected ? 'text-accent-dark' : 'text-text'
                }`}
              >
                {category.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
