import { formatVND } from '@/lib/utils'
import type { MonthStats } from '@/hooks/useCalendar'

interface MonthSummaryProps {
  stats: MonthStats
}

export function MonthSummary({ stats }: MonthSummaryProps) {
  const { total, avgPerDay, maxDay, maxDayAmount } = stats

  const maxDayLabel = maxDay
    ? `${maxDay.slice(8)}/${maxDay.slice(5, 7)}`
    : '—'

  return (
    <div className="mx-4 flex overflow-hidden rounded-[14px] border border-border bg-surface">
      <StatCell label="Tổng tháng" value={`${formatVND(total)}đ`} />
      <div className="w-px bg-border" />
      <StatCell
        label="Ngày cao nhất"
        value={maxDay ? `${maxDayLabel} · ${formatVND(maxDayAmount)}đ` : '—'}
      />
      <div className="w-px bg-border" />
      <StatCell label="TB/ngày" value={avgPerDay > 0 ? `${formatVND(avgPerDay)}đ` : '—'} />
    </div>
  )
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col items-center px-2 py-3">
      <span className="text-text-hint w-full text-center text-[9px] font-medium uppercase tracking-[0.8px]">
        {label}
      </span>
      <span className="font-num mt-1 w-full text-center text-[11px] font-semibold leading-tight">
        {value}
      </span>
    </div>
  )
}
