import { formatVND, formatShort } from '@/lib/utils'
import type { FinancialSettings } from '@/types'
import { motion } from 'framer-motion'
import * as React from 'react'

interface HeroSectionProps {
  settings: FinancialSettings | null
  todaySpent: number
  monthSpent: number
  remainingBudget: number | null
  dailyAllowance: number | null
  spentPct: number | null
  daysLeft?: number
}

export const HeroSection = React.memo(({
  settings,
  remainingBudget,
  dailyAllowance,
  spentPct,
  daysLeft = 0,
}: HeroSectionProps) => {
  const hasIncome = !!settings?.income

  // Simple render for no income
  if (!hasIncome || remainingBudget === null || dailyAllowance === null || spentPct === null) {
      return (
        <div className="px-5 py-2">
          <p className="text-text text-[15px] font-semibold italic opacity-80">Mochi Money 🍡</p>
        </div>
      )
  }

  const pctInt = Math.round(spentPct * 100)
  const isOver = remainingBudget < 0

  return (
    <div className="px-4">
      <div className="rounded-[24px] p-5 relative overflow-hidden bg-white border border-border/80 shadow-sm">
        <div className="relative flex flex-col gap-5">
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-text-hint mb-1">
              Còn lại tháng này
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className={`font-num text-[40px] font-bold leading-none tracking-tight ${isOver ? 'text-danger' : 'text-text'}`}>
                {isOver ? '-' : ''}{formatVND(Math.abs(remainingBudget))}
              </span>
              <span className="text-text-muted text-base font-bold">đ</span>
            </div>
          </div>

          <div className="flex items-end gap-4 mt-1">
            <div className="flex-1 pb-1">
              <div className="flex justify-between text-[11px] font-bold text-text mb-2 px-0.5">
                <span className={pctInt >= 100 ? 'text-danger' : 'text-accent'}>
                  {pctInt}% đã dùng
                </span>
                <span className="text-text-hint font-medium">{daysLeft} ngày còn lại</span>
              </div>
              <div className="h-3 rounded-full bg-surface2/50 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, pctInt)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background: isOver 
                      ? 'var(--color-danger)' 
                      : `linear-gradient(90deg, var(--color-success), var(--color-accent))`,
                  }}
                />
              </div>
            </div>
            
            <div className="shrink-0 flex flex-col items-center justify-center min-w-[80px] py-3 rounded-[18px] bg-white border border-border/60 shadow-sm">
              <span className="text-[9px] font-bold text-text-hint uppercase tracking-tighter mb-0.5 opacity-80">HÔM NAY</span>
              <span className="font-num text-[16px] font-black text-accent tracking-tight">
                {formatShort(Math.round(dailyAllowance))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
