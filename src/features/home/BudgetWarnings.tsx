import { AlertTriangle, AlertCircle } from 'lucide-react'
import { formatBudgetPct } from '@/lib/utils'
import type { BudgetCategory } from '@/types'

interface BudgetWarningsProps {
  warnings: { category: BudgetCategory; spent: number; pct: number }[]
}

export function BudgetWarnings({ warnings }: BudgetWarningsProps) {
  if (warnings.length === 0) return null

  return (
    <div className="px-4 flex flex-col gap-2.5">
      {warnings.map(({ category, pct }) => {
        const isOver = pct > 1
        const pctFormattedStr = formatBudgetPct(pct * 100)

        if (isOver) {
          return (
            <div
              key={category.id}
              className="flex items-center gap-2 flex-row"
              style={{
                backgroundColor: '#FFF0F0',
                borderColor: '#FFC5C5',
                borderWidth: 1,
                borderStyle: 'solid',
                borderRadius: 12,
                padding: '10px 14px',
                color: '#D63E3E', // text-danger
              }}
            >
              <AlertCircle size={14} className="shrink-0" />
              <span style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.3 }}>
                <span style={{ fontWeight: 700 }}>{category.name}</span> đã vượt ngân sách ({pctFormattedStr})
              </span>
            </div>
          )
        }

        return (
          <div
            key={category.id}
            className="flex items-center gap-2 flex-row"
            style={{
              backgroundColor: '#FFFBEB',
              borderColor: '#F5D080',
              borderWidth: 1,
              borderStyle: 'solid',
              borderRadius: 12,
              padding: '10px 14px',
              color: '#B87B10', // Darker amber for contrast
            }}
          >
            <AlertTriangle size={14} className="shrink-0" />
            <span style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.3 }}>
              <span style={{ fontWeight: 700 }}>{category.name}</span> sắp vượt ngân sách ({pctFormattedStr})
            </span>
          </div>
        )
      })}
    </div>
  )
}
