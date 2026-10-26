import { formatVND, formatShort } from '@/lib/utils'
import { CalendarDays, Sun, Target, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react'
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
  lastMonthSpent?: number
}

export const HeroSection = React.memo(({
  settings,
  todaySpent,
  monthSpent,
  remainingBudget,
  dailyAllowance,
  spentPct,
  daysLeft = 0,
  lastMonthSpent = 0,
}: HeroSectionProps) => {
  const hasIncome = !!settings?.income
  const pctInt = spentPct !== null ? Math.round(spentPct * 100) : null
  const isOver = (remainingBudget ?? 0) < 0

  // Trend vs last month
  const hasTrend = lastMonthSpent > 0
  const diff = monthSpent - lastMonthSpent
  const isIncrease = diff > 0
  const trendPct = hasTrend ? Math.abs(Math.round((diff / lastMonthSpent) * 100)) : 0

  const tiles: { label: string; value: number; icon: LucideIcon; highlight?: boolean }[] = [
    { label: 'Hôm nay', value: todaySpent, icon: Sun },
    { label: 'Tháng này', value: monthSpent, icon: CalendarDays },
  ]
  if (hasIncome && dailyAllowance !== null) {
    tiles.push({ label: 'Mỗi ngày', value: Math.round(dailyAllowance), icon: Target, highlight: true })
  }

  return (
    <div className="px-4 z-10 relative flex flex-col gap-3">
      {/* ── Hero card ── */}
      <div
        className={`glass-accent rounded-[28px] relative overflow-hidden ${
          isOver ? 'animate-[pulse-border_2s_ease-in-out_infinite]' : ''
        }`}
        style={
          isOver
            ? {
                background:
                  'radial-gradient(120% 90% at 100% 0%, rgba(255,255,255,0.18) 0%, transparent 45%), linear-gradient(150deg, rgba(220,38,38,0.9) 0%, rgba(127,29,29,0.75) 100%)',
                boxShadow: '0 24px 48px -16px rgba(220,38,38,0.55), 0 0 0 1px rgba(255,255,255,0.15)',
              }
            : undefined
        }
      >
        {/* Decorative orbs */}
        <div className="absolute -right-12 -top-16 size-48 rounded-full bg-white/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-14 size-40 rounded-full bg-black/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 p-5">
          {/* ── Label + trend badge ── */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-bold text-white/80">
              {hasIncome ? 'Còn lại tháng này' : 'Chi tiêu tháng này'}
            </p>
            {hasTrend && (
              <div className="flex items-center gap-1 h-6 px-2 rounded-full text-[10px] font-bold text-white bg-black/20 border border-white/15 backdrop-blur-sm">
                {isIncrease ? <TrendingUp size={11} strokeWidth={2.5} /> : <TrendingDown size={11} strokeWidth={2.5} />}
                <span>{formatShort(Math.abs(diff))}đ</span>
                {trendPct > 0 && <span className="opacity-75">· {trendPct}%</span>}
              </div>
            )}
          </div>

          {/* ── Hero number ── */}
          <div className="flex items-baseline gap-1.5">
            <span
              className="font-num leading-none tracking-tighter font-black text-white"
              style={{ fontSize: 44, textShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
            >
              {hasIncome
                ? `${isOver ? '-' : ''}${formatVND(Math.abs(remainingBudget ?? 0))}`
                : formatVND(monthSpent)}
            </span>
            <span className="text-white/70 text-[18px] font-bold">đ</span>
          </div>

          {/* ── Progress (only with budget) ── */}
          {hasIncome && pctInt !== null && (
            <div className="mt-5">
              <div className="h-2 rounded-full bg-black/25 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, pctInt)}%` }}
                  transition={{ duration: 0.9, type: 'spring', bounce: 0 }}
                  className="h-full rounded-full"
                  style={{
                    background: isOver ? 'rgba(255,200,200,0.95)' : 'linear-gradient(90deg, rgba(255,255,255,0.75), #FFFFFF)',
                    boxShadow: '0 0 12px rgba(255,255,255,0.45)',
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-semibold text-white/75 mt-2">
                <span>{pctInt}% đã dùng</span>
                <span>{daysLeft} ngày còn lại</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stat tiles ── */}
      <div className={`grid gap-2.5 ${tiles.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {tiles.map(({ label, value, icon: Icon, highlight }) => (
          <div key={label} className="glass rounded-[20px] p-3">
            <div
              className="size-7 rounded-[10px] flex items-center justify-center mb-2.5"
              style={{
                background: highlight ? 'rgba(var(--color-accent-rgb), 0.2)' : 'rgba(255,255,255,0.07)',
                color: highlight ? 'var(--color-accent-dark)' : 'var(--color-text-muted)',
              }}
            >
              <Icon size={14} strokeWidth={2.5} />
            </div>
            <p className="text-[11px] font-semibold text-text-muted mb-0.5">{label}</p>
            <p className="font-num text-[17px] font-black text-text leading-none">
              {/* formatShort already appends "đ" for values < 1k — avoid "0đđ" */}
              {formatShort(value).replace(/đ$/, '')}
              <span className="text-[11px] font-medium text-text-hint ml-0.5">đ</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
})
