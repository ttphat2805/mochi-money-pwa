import { formatShort } from '@/lib/utils'
import type { MonthStats } from '@/hooks/useCalendar'
import { Wallet, Sparkles, TrendingUp } from 'lucide-react'

interface MonthSummaryProps {
  stats: MonthStats
}

export function MonthSummary({ stats }: MonthSummaryProps) {
  const { total, avgPerDay, maxDay, maxDayAmount } = stats

  const maxDayLabel = maxDay ? `${maxDay.slice(8)}/${maxDay.slice(5, 7)}` : '—'

  return (
    <div className="px-4 grid grid-cols-3 gap-3">
      {/* Total month */}
      <div className="bg-white rounded-[24px] p-3.5 border border-border/60 shadow-sm flex flex-col relative overflow-hidden group">
        <div className="size-7 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-2.5">
           <Wallet size={14} />
        </div>
        <p className="text-[9px] font-black text-text-hint uppercase tracking-widest leading-none mb-1">Tổng chi</p>
        <p className="font-num text-[15px] font-black text-text tracking-tighter leading-none">
          {formatShort(total)}<span className="text-[10px] font-medium opacity-60 ml-0.5">đ</span>
        </p>
      </div>
      
      {/* Highest day */}
      <div className="bg-white rounded-[24px] p-3.5 border border-border/60 shadow-sm flex flex-col relative overflow-hidden group">
        <div className="size-7 rounded-full bg-danger/10 flex items-center justify-center text-danger mb-2.5">
           <TrendingUp size={14} />
        </div>
        <p className="text-[9px] font-black text-text-hint uppercase tracking-widest leading-none mb-1">Tối đa ({maxDayLabel})</p>
        <p className="font-num text-[15px] font-black text-danger tracking-tighter leading-none">
          {formatShort(maxDayAmount)}<span className="text-[10px] font-medium opacity-60 ml-0.5">đ</span>
        </p>
      </div>

      {/* Avg daily */}
      <div className="bg-white rounded-[24px] p-3.5 border border-border/60 shadow-sm flex flex-col relative overflow-hidden group">
        <div className="size-7 rounded-full bg-success/10 flex items-center justify-center text-success mb-2.5">
           <Sparkles size={14} />
        </div>
        <p className="text-[9px] font-black text-text-hint uppercase tracking-widest leading-none mb-1">Trung bình</p>
        <p className="font-num text-[15px] font-black text-success tracking-tighter leading-none">
          {formatShort(Math.round(avgPerDay))}<span className="text-[10px] font-medium opacity-60 ml-0.5">đ</span>
        </p>
      </div>
    </div>
  )
}
