import { formatVND } from '@/lib/utils'
import type { FinancialSettings } from '@/types'

interface StatCardsProps {
  monthTotal: number
  settings: FinancialSettings | null
}

export function StatCards({ monthTotal, settings }: StatCardsProps) {
  const income = settings?.income ?? null
  const saving = settings?.savingTarget ?? null
  const remaining = income != null ? income - (saving ?? 0) - monthTotal : null

  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      <StatCard
        label="Thu nhập"
        value={income}
        color="text-success"
      />
      <StatCard
        label="Đã chi"
        value={monthTotal}
        color="text-danger"
        always
      />
      <StatCard
        label="Tiết kiệm"
        value={saving}
        color="text-accent"
      />
      <StatCard
        label="Còn lại"
        value={remaining}
        color={remaining != null && remaining < 0 ? 'text-danger' : 'text-text'}
      />
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number | null
  color: string
  always?: boolean
}

function StatCard({ label, value, color, always }: StatCardProps) {
  const show = always || value != null

  return (
    <div className="rounded-[14px] border border-border bg-white p-3.5">
      <p className="text-text-hint text-[10px] font-medium uppercase tracking-[0.8px]">
        {label}
      </p>
      <p className={`font-num mt-1.5 text-[20px] font-bold leading-none ${show ? color : 'text-text-hint'}`}>
        {show && value != null ? `${formatVND(value)}đ` : '—'}
      </p>
    </div>
  )
}
