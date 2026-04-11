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
    <div className="px-4 z-10 relative">
      <div className="rounded-[32px] p-6 relative overflow-hidden bg-white/60 border border-white/60 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
        {/* Soft inner gloss light top */}
        <div className="absolute top-0 inset-x-0 h-[60%] bg-gradient-to-b from-white/80 to-transparent opacity-60 pointer-events-none z-0" />
        
        {/* Modern UI Bubbles / Glowing Orbs in background */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/40 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="absolute -left-12 top-12 w-32 h-32 bg-[var(--color-accent)]/5 rounded-full blur-2xl pointer-events-none z-0" />
        <div className="absolute right-12 -bottom-10 w-32 h-32 bg-[var(--color-success)]/10 rounded-full blur-2xl pointer-events-none z-0" />

        <div className="relative flex flex-col gap-6 z-10">
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-text-hint mb-1">
              Còn lại tháng này
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`font-num text-[44px] font-black leading-none tracking-tighter ${isOver ? 'text-danger' : 'text-text'}`}>
                {isOver ? '-' : ''}{formatVND(Math.abs(remainingBudget))}
              </span>
            </div>
          </div>

          <div className="flex items-end gap-5 mt-2">
            <div className="flex-1 pb-1">
              <div className="flex justify-between text-[11px] font-bold mb-2">
                <span className={pctInt >= 100 ? 'text-danger' : 'text-[var(--color-accent)]'}>
                  {pctInt}% đã dùng
                </span>
                <span className="text-text-hint font-medium">{daysLeft} ngày còn lại</span>
              </div>
              <div className="h-3.5 rounded-full bg-surface2/60 shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden p-[2px]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, pctInt)}%` }}
                  transition={{ duration: 1, type: "spring", bounce: 0 }}
                  className="h-full rounded-full relative"
                  style={{
                    background: isOver 
                      ? 'var(--color-danger)' 
                      : `linear-gradient(90deg, var(--color-success), var(--color-accent))`,
                    boxShadow: 'inset 0px 2px 3px rgba(255, 255, 255, 0.4), inset 0px -2px 3px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  {/* Glass highlight overhead */}
                  <div className="absolute top-0 left-0 w-full h-[45%] bg-gradient-to-b from-white/70 to-white/5 rounded-t-full pointer-events-none" />
                  
                  {/* Liquid reflection gloss on the right edge */}
                  <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-white/40 to-transparent rounded-r-full pointer-events-none mix-blend-overlay" />
                </motion.div>
              </div>
            </div>
            
            <div className="shrink-0 flex flex-col items-center justify-center min-w-[92px] py-3.5 rounded-[24px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-white/80 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent pointer-events-none" />
              <span className="text-[10px] font-bold text-text-hint uppercase tracking-tight mb-0.5 opacity-80 relative">HÔM NAY</span>
              <span className="font-num text-[18px] font-black text-[var(--color-accent)] tracking-tight relative leading-none">
                {formatShort(Math.round(dailyAllowance))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
