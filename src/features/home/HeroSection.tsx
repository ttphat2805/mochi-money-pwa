import { formatVND, formatShort } from '@/lib/utils'
import type { FinancialSettings } from '@/types'

interface HeroSectionProps {
  settings: FinancialSettings | null
  todaySpent: number
  monthSpent: number
  remainingBudget: number | null
  dailyAllowance: number | null
  spentPct: number | null
  daysLeft?: number
}

export function HeroSection({
  settings,
  remainingBudget,
  dailyAllowance,
  spentPct,
  daysLeft = 0,
}: HeroSectionProps) {
  const hasIncome = !!settings?.income

  if (hasIncome && remainingBudget !== null && dailyAllowance !== null && spentPct !== null) {
    const pctInt = Math.round(spentPct * 100)
    const isOver = remainingBudget < 0
    const barColor = isOver ? '#D63E3E' : pctInt >= 90 ? '#E8A020' : '#2A9D6E'

    return (
      <div className="px-4">
        <div
          className="rounded-2xl p-5 relative overflow-hidden bg-white"
          style={{
            border: '1px solid #E8E6E0',
            boxShadow: `
              0 1px 0 rgba(255,255,255,0.8) inset,
              0 2px 12px rgba(0,0,0,0.04),
              0 8px 24px rgba(0,0,0,0.02)
            `,
          }}
        >
          {/* Subtle 3D Shine */}
          <div 
            className="absolute inset-0 pointer-events-none" 
            style={{ 
              background: 'linear-gradient(145deg, rgba(255,255,255,0.6) 0%, transparent 40%)'
            }} 
          />

          <div className="relative flex flex-col gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-text-hint mb-1">
                Còn lại tháng này
              </p>
              <div className="flex items-baseline gap-1">
                <span
                  className={`font-num text-[40px] font-bold leading-none tracking-[-2px] ${
                    isOver ? 'text-danger' : 'text-text'
                  }`}
                >
                  {isOver ? '-' : ''}{formatVND(Math.abs(remainingBudget))}
                </span>
                <span className="text-text-muted text-lg font-medium">đ</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-2 rounded-full bg-surface2 overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, pctInt)}%`,
                      background: barColor,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-num text-text-hint font-medium">
                  <span>{pctInt}% đã dùng</span>
                  <span>{daysLeft} ngày còn lại</span>
                </div>
              </div>
              
              <div 
                className="shrink-0 flex flex-col items-center justify-center min-w-[76px] py-1.5 rounded-xl bg-surface"
                style={{ border: '1px solid #E8E6E0' }}
              >
                <span className="text-[9px] font-bold text-text-hint uppercase tracking-tighter">HÔM NAY CÒN</span>
                <span className="font-num text-[15px] font-bold text-accent">
                  {formatShort(Math.round(dailyAllowance))}đ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 py-2">
      <p className="text-text text-[16px] font-semibold italic">Mochi Money 🍡</p>
    </div>
  )
}
