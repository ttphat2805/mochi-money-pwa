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
    const barColor = isOver ? 'var(--color-danger)' : pctInt >= 90 ? 'var(--color-accent)' : 'var(--color-success)'

    return (
      <div className="px-4">
        <div
          className="rounded-[28px] p-6 relative overflow-hidden bg-white/80 shadow-premium border border-white/60"
        >
          {/* Decorative Mesh Background */}
          <div className="absolute top-0 right-0 w-[140px] h-[140px] bg-accent/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-[100px] h-[100px] bg-success/10 rounded-full blur-2xl -ml-10 -mb-10" />

          <div className="relative flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-text-hint/80 mb-1.5 mix-blend-multiply">
                  Còn lại tháng này
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`font-num text-[44px] font-bold leading-none tracking-[-2.5px] ${
                      isOver ? 'text-danger' : 'text-text'
                    }`}
                  >
                    {isOver ? '-' : ''}{formatVND(Math.abs(remainingBudget))}
                  </span>
                  <span className="text-text-muted text-lg font-bold">đ</span>
                </div>
              </div>
            </div>

            <div className="flex items-end gap-4 mt-1">
              <div className="flex-1 pb-1">
                <div className="flex justify-between text-[11px] font-bold text-text mb-2 px-0.5">
                  <span className={pctInt >= 100 ? 'text-danger' : 'text-accent'}>{pctInt}% đã dùng</span>
                  <span className="text-text-hint font-medium">{daysLeft} ngày còn lại</span>
                </div>
                <div className="h-3 rounded-full bg-surface2/50 p-0.5 border border-white/40 shadow-inner overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)"
                    style={{
                      width: `${Math.min(100, pctInt)}%`,
                      background: isOver 
                        ? 'var(--color-danger)' 
                        : `linear-gradient(90deg, var(--color-success), var(--color-accent))`,
                      boxShadow: `0 0 12px ${barColor}50`
                    }}
                  />
                </div>
              </div>
              
              <div 
                className="shrink-0 flex flex-col items-center justify-center min-w-[84px] py-4 rounded-[22px] bg-white shadow-premium border border-white active-scale cursor-default"
              >
                <span className="text-[9px] font-black text-text-hint uppercase tracking-tighter mb-1 opacity-70">HÔM NAY CÒN</span>
                <span className="font-num text-[17px] font-black text-accent tracking-tight">
                  {formatShort(Math.round(dailyAllowance))}
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
