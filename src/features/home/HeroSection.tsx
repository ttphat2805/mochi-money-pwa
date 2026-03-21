import { formatVND, getVietnameseDay } from '@/lib/utils'
import type { FinancialSettings } from '@/types'

interface HeroSectionProps {
  settings: FinancialSettings | null
  todaySpent: number
  monthSpent: number
  remainingBudget: number | null
  dailyAllowance: number | null
  spentPct: number | null
}

export function HeroSection({
  settings,
  todaySpent,
  remainingBudget,
  dailyAllowance,
  spentPct,
}: HeroSectionProps) {
  const hasIncome = !!settings?.income

  if (hasIncome && remainingBudget !== null && dailyAllowance !== null && spentPct !== null) {
    return (
      <div className="px-5 py-2">
        <span className="text-text-hint text-[11px] font-medium uppercase tracking-[1.2px]">
          Còn lại tháng này
        </span>

        <div className="mt-1 flex items-baseline gap-1">
          <span
            className={`font-num text-[44px] font-bold leading-none tracking-[-2px] ${
              remainingBudget < 0 ? 'text-danger' : 'text-text'
            }`}
          >
            {remainingBudget < 0 ? '-' : ''}{formatVND(Math.abs(remainingBudget))}
          </span>
          <span className="text-text-muted text-base">đ</span>
        </div>

        <p className="text-text-muted mt-1 text-[12px]">
          Hôm nay còn{' '}
          <span className="text-text font-medium">{formatVND(Math.round(dailyAllowance))}đ</span>
          {' '}· đã chi{' '}
          <span className="text-text font-medium">{formatVND(todaySpent)}đ</span>
        </p>

        {/* Progress bar */}
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-surface2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              spentPct > 0.9 ? 'bg-danger' : 'bg-accent'
            }`}
            style={{ width: `${Math.round(spentPct * 100)}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-text-hint text-[10px]">{Math.round(spentPct * 100)}% đã chi</span>
          <span className="text-text-hint text-[10px]">{Math.round((1 - spentPct) * 100)}% còn lại</span>
        </div>
      </div>
    )
  }

  // Simple greeting (no income set)
  return (
    <div className="px-5 py-2">
      <span className="text-[13px] font-semibold">{getVietnameseDay()}</span>
      <p className="text-text-muted mt-0.5 text-[12px]">
        Hôm nay đã chi{' '}
        <span className="text-text font-medium">{formatVND(todaySpent)}đ</span>
      </p>
    </div>
  )
}
