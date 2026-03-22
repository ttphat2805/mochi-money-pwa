import { AlertTriangle, AlertCircle } from 'lucide-react'
import { formatBudgetPct, formatVND } from '@/lib/utils'
import type { BudgetCategory } from '@/types'

interface BudgetWarningsProps {
  warnings: { category: BudgetCategory; spent: number; pct: number }[]
}

export function BudgetWarnings({ warnings }: BudgetWarningsProps) {
  if (warnings.length === 0) return null

  return (
    <div className="px-4 flex flex-col gap-2">
      {warnings.map(({ category, spent, pct }) => {
        const isOver = pct > 1
        const isFull = pct === 1
        const overspentVND = category.limitPerMonth ? Math.max(0, spent - category.limitPerMonth) : 0
        
        // PCT formatted might include "Vượt " so we strip it to avoid duplication
        const pctFormattedStr = formatBudgetPct(pct * 100).replace("Vượt ", "")

        // Only show RED (Danger) if truly over 100%
        if (isOver) {
          return (
            <div
              key={category.id}
              className="flex items-center gap-2.5 bg-danger/10 border border-danger/30 p-3 rounded-[18px] shadow-sm animate-in zoom-in-95 duration-200 active-scale"
            >
              <div className="size-7 rounded-full bg-danger/20 flex items-center justify-center shrink-0">
                <AlertCircle size={14} className="text-danger" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[11px] font-black text-danger uppercase tracking-wider leading-tight">Vượt ngân sách</h4>
                <p className="text-[11px] text-danger/80 font-bold leading-tight truncate">
                  <span className="text-text font-black">{category.name}</span> vượt <span className="font-black text-danger">{formatVND(overspentVND)}đ</span> ({pctFormattedStr})
                </p>
              </div>
            </div>
          )
        }

        // Show AMBER (Accent) for 100% or nearly full
        return (
          <div
            key={category.id}
            className="flex items-center gap-2.5 bg-accent/10 border border-accent/30 p-3 rounded-[18px] shadow-sm animate-in zoom-in-95 duration-200 active-scale"
          >
            <div className="size-7 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <AlertTriangle size={14} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[11px] font-black text-accent uppercase tracking-wider leading-tight">
                {isFull ? "Đã đạt hạn mức" : "Sắp vượt hạn mức"}
              </h4>
              <p className="text-[11px] text-accent-dark font-bold leading-tight truncate">
                <span className="text-text font-black">{category.name}</span> đã tiêu {pctFormattedStr}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
