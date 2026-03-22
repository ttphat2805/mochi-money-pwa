import { formatVND } from '@/lib/utils'
import type { MonthStats } from '@/hooks/useCalendar'

interface MonthSummaryProps {
  stats: MonthStats
}

export function MonthSummary({ stats }: MonthSummaryProps) {
  const { total, avgPerDay, maxDay, maxDayAmount } = stats

  const formattedTotal = `${formatVND(total)}đ`
  const formattedAvg = avgPerDay > 0 ? `${formatVND(avgPerDay)}đ` : '—'
  const maxDayLabel = maxDay ? `${maxDay.slice(8)}/${maxDay.slice(5, 7)}` : '—'
  const formattedMax = maxDay ? `${formatVND(maxDayAmount)}đ` : '—'

  return (
    <div className="mx-4 grid grid-cols-3 gap-2.5">
      {/* Total month */}
      <div className="bg-white rounded-2xl p-3 border border-border shadow-sm flex flex-col items-center justify-center min-h-[64px]">
        <span className="text-[9px] font-bold text-text-hint uppercase tracking-widest mb-1.5 opacity-80">Tổng chi</span>
        <span className="font-num text-[14px] font-bold text-text truncate w-full text-center tracking-tight">{formattedTotal}</span>
      </div>
      
      {/* Highest day */}
      <div className="bg-white rounded-2xl p-3 border border-border shadow-sm flex flex-col items-center justify-center min-h-[64px]">
        <span className="text-[9px] font-bold text-text-hint uppercase tracking-widest mb-1.5 opacity-80">Cao nhất</span>
        <div className="flex flex-col items-center leading-tight">
            <span className="text-[10px] text-text-muted font-medium mb-0.5">{maxDayLabel}</span>
            <span className="font-num text-[11px] font-bold text-danger">{formattedMax}</span>
        </div>
      </div>

      {/* Avg daily */}
      <div className="bg-white rounded-2xl p-3 border border-border shadow-sm flex flex-col items-center justify-center min-h-[64px]">
        <span className="text-[9px] font-bold text-text-hint uppercase tracking-widest mb-1.5 opacity-80">Trung bình</span>
        <span className="font-num text-[14px] font-bold text-accent truncate w-full text-center tracking-tight">{formattedAvg}</span>
      </div>
    </div>
  )
}
