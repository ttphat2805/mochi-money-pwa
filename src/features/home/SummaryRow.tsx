import { formatVND } from '@/lib/utils'

interface SummaryRowProps {
  todaySpent: number
  monthSpent: number
  remainingBudget: number | null
}

export function SummaryRow({ todaySpent, monthSpent, remainingBudget }: SummaryRowProps) {
  return (
    <div className="mx-4 flex overflow-hidden rounded-xl border border-border bg-white">
      <Stat label="Hôm nay" value={todaySpent} />
      <div className="w-px bg-border" />
      <Stat label="Tháng này" value={monthSpent} />
      <div className="w-px bg-border" />
      <Stat
        label="Còn lại"
        value={remainingBudget}
        dangerWhenNegative
      />
    </div>
  )
}

interface StatProps {
  label: string
  value: number | null
  dangerWhenNegative?: boolean
}

function Stat({ label, value, dangerWhenNegative }: StatProps) {
  const isNeg = dangerWhenNegative && value != null && value < 0
  return (
    <div className="flex flex-1 flex-col items-center py-3">
      <span className="text-text-muted text-[10px] font-medium uppercase tracking-[0.8px]">
        {label}
      </span>
      <span className={`font-num mt-0.5 text-[13px] font-semibold ${isNeg ? 'text-danger' : 'text-text'}`}>
        {value == null ? '—' : `${formatVND(Math.abs(value))}đ`}
      </span>
    </div>
  )
}
