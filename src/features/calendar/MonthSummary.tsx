import { formatShort, formatVND, tint } from '@/lib/utils'
import type { MonthStats } from '@/hooks/useCalendar'
import { Wallet, Flame, TrendingUp } from 'lucide-react'
import { usePersonalization } from '@/hooks/usePersonalization'

interface MonthSummaryProps {
  stats: MonthStats
}

export function MonthSummary({ stats }: MonthSummaryProps) {
  const { settings } = usePersonalization()
  const accent = settings.accentColor
  const { total, avgPerDay, maxDay, maxDayAmount } = stats

  const maxDayLabel = maxDay
    ? `${maxDay.slice(8)}/${maxDay.slice(5, 7)}`
    : '—'

  const cards = [
    {
      icon: <Wallet size={15} />,
      label: 'Tổng chi',
      value: formatShort(total),
      sub: total > 0 ? `${formatVND(total)}đ` : '—',
      color: 'var(--color-accent-dark)',
      bg: tint(accent, 18),
    },
    {
      icon: <Flame size={15} />,
      label: `Cao nhất`,
      value: maxDayAmount > 0 ? formatShort(maxDayAmount) : '—',
      sub: maxDayAmount > 0 ? `Ngày ${maxDayLabel}` : 'Chưa có',
      color: 'var(--color-danger)',
      bg: 'rgba(220,38,38,0.18)',
    },
    {
      icon: <TrendingUp size={15} />,
      label: 'Mỗi ngày TB',
      value: avgPerDay > 0 ? formatShort(Math.round(avgPerDay)) : '—',
      sub: avgPerDay > 0 ? 'có chi tiêu' : 'Chưa có',
      color: 'var(--color-success)',
      bg: 'rgba(16,185,129,0.18)',
    },
  ]

  return (
    <div className="px-4">
      <p className="section-title mb-2.5 px-1">Tổng kết tháng</p>
      <div className="grid grid-cols-3 gap-2.5">
        {cards.map((c) => (
          <div
            key={c.label}
            className="glass rounded-[20px] p-3.5 flex flex-col gap-2.5 relative overflow-hidden"
          >
            {/* Soft color glow in the corner */}
            <div
              className="absolute -top-6 -right-6 size-16 rounded-full blur-2xl pointer-events-none"
              style={{ background: c.bg }}
            />

            {/* Icon */}
            <div
              className="relative size-8 rounded-[10px] flex items-center justify-center"
              style={{ background: c.bg, color: c.color }}
            >
              {c.icon}
            </div>

            {/* Label */}
            <p className="relative text-[10px] font-bold text-text-muted leading-none">
              {c.label}
            </p>

            {/* Value */}
            <div className="relative">
              <p className="font-num text-[17px] font-black tracking-tighter leading-none text-text">
                {c.value}
                {c.value !== '—' && (
                  <span className="text-[10px] font-medium text-text-hint ml-0.5">đ</span>
                )}
              </p>
              <p className="text-[9.5px] mt-1 font-semibold truncate" style={{ color: c.color }}>
                {c.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
