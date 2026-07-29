import { formatVND, formatShort, tint } from '@/lib/utils'
import type { FinancialSettings } from '@/types'
import { motion } from 'framer-motion'
import * as React from 'react'
import { usePersonalization } from '@/hooks/usePersonalization'
import { ChibiCharacter } from '@/components/ui/ChibiCharacter'

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
  const { settings: appSettings } = usePersonalization()
  const accent = appSettings.accentColor
  const hasIncome = !!settings?.income
  const pctInt = spentPct !== null ? Math.round(spentPct * 100) : null
  const isOver = (remainingBudget ?? 0) < 0

  // Determine chibi mood based on spending
  const chibiMood: 'happy' | 'concerned' | 'neutral' = 
    isOver ? 'concerned' : (pctInt !== null && pctInt > 75) ? 'concerned' : 'happy'

  // Trend vs last month
  const hasTrend = lastMonthSpent > 0
  const diff = monthSpent - lastMonthSpent
  const isIncrease = diff > 0
  const trendPct = hasTrend ? Math.abs(Math.round((diff / lastMonthSpent) * 100)) : 0

  return (
    <div className="px-4 z-10 relative">
      <div
        className={`rounded-[28px] relative overflow-visible ${
          isOver ? 'animate-[pulse-border_2s_ease-in-out_infinite]' : ''
        }`}
        style={{
          background: `linear-gradient(145deg, ${accent}F0 0%, ${accent}CC 100%)`,
          boxShadow: isOver
            ? `0 16px 48px rgba(220,38,38,0.35), 0 4px 12px rgba(220,38,38,0.2), 0 0 0 2px rgba(220,38,38,0.5)`
            : `0 16px 48px ${tint(accent, 25)}, 0 4px 12px ${tint(accent, 15)}`,
        }}
      >
        {/* Chibi Character */}
        <div className="absolute -top-8 -right-6 z-20 pointer-events-none">
          <ChibiCharacter mood={chibiMood} size="md" />
        </div>

        {/* Decorative gloss blobs */}
        <div className="absolute -right-10 -top-10 w-44 h-44 bg-white/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-32 h-32 bg-black/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[55%] bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

        <div className="relative z-10 p-5 pb-4">
          {/* ── Top row: label + trend badge ── */}
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] font-bold tracking-[2px] uppercase text-white/70">
              {hasIncome ? 'Còn lại tháng này' : 'Chi tiêu tháng này'}
            </p>
            {hasTrend && (
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{
                  background: isIncrease ? 'rgba(220,38,38,0.25)' : 'rgba(34,197,94,0.25)',
                  color: 'white',
                }}
              >
                <span>{isIncrease ? '↑' : '↓'}</span>
                <span>{formatShort(Math.abs(diff))}đ</span>
                {trendPct > 0 && (
                  <span className="opacity-80">({trendPct}%)</span>
                )}
              </div>
            )}
          </div>

          {/* ── Hero number ── */}
          <div className="flex items-baseline gap-1 mb-4">
            <span
              className="font-num leading-none tracking-tighter font-black text-white"
              style={{ fontSize: 42, textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            >
              {hasIncome
                ? `${isOver ? '-' : ''}${formatVND(Math.abs(remainingBudget ?? 0))}`
                : formatVND(monthSpent)}
            </span>
            <span className="text-white/60 text-[14px] font-medium mb-1">đ</span>
          </div>

          {/* ── Progress bar (only with budget) ── */}
          {hasIncome && pctInt !== null && (
            <div className="mb-4">
              <div className="flex justify-between text-[10px] font-bold text-white/70 mb-1.5">
                <span>{pctInt}% đã dùng</span>
                <span>{daysLeft} ngày còn lại</span>
              </div>
              <div className="h-2.5 rounded-full bg-black/20 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, pctInt)}%` }}
                  transition={{ duration: 0.9, type: 'spring', bounce: 0 }}
                  className="h-full rounded-full relative"
                  style={{
                    background: isOver
                      ? 'rgba(255,80,80,0.9)'
                      : 'rgba(255,255,255,0.85)',
                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4)',
                  }}
                />
              </div>
            </div>
          )}

          {/* ── Bottom stat pills ── */}
          <div className="flex gap-2">
            {/* Today spent */}
            <div className="flex-1 rounded-[16px] bg-black/15 px-3 py-2.5 backdrop-blur-sm">
              <p className="text-[9px] font-bold text-white/60 uppercase tracking-wider mb-0.5">Hôm nay</p>
              <p className="font-num text-[16px] font-black text-white leading-none">
                {formatShort(todaySpent)}<span className="text-[11px] font-medium opacity-70 ml-0.5">đ</span>
              </p>
            </div>

            {/* Month spent */}
            <div className="flex-1 rounded-[16px] bg-black/15 px-3 py-2.5 backdrop-blur-sm">
              <p className="text-[9px] font-bold text-white/60 uppercase tracking-wider mb-0.5">Tháng này</p>
              <p className="font-num text-[16px] font-black text-white leading-none">
                {formatShort(monthSpent)}<span className="text-[11px] font-medium opacity-70 ml-0.5">đ</span>
              </p>
            </div>

            {/* Daily allowance (only with budget) */}
            {hasIncome && dailyAllowance !== null && (
              <div className="flex-1 rounded-[16px] bg-white/20 px-3 py-2.5 backdrop-blur-sm border border-white/30">
                <p className="text-[9px] font-bold text-white/70 uppercase tracking-wider mb-0.5">Mỗi ngày</p>
                <p className="font-num text-[16px] font-black text-white leading-none">
                  {formatShort(Math.round(dailyAllowance))}<span className="text-[11px] font-medium opacity-70 ml-0.5">đ</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
