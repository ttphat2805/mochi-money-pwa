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
      color: accent,
      bg: tint(accent, 7),
    },
    {
      icon: <Flame size={15} />,
      label: `Cao nhất`,
      value: maxDayAmount > 0 ? formatShort(maxDayAmount) : '—',
      sub: maxDayAmount > 0 ? `Ngày ${maxDayLabel}` : 'Chưa có',
      color: 'var(--color-danger)',
      bg: 'rgba(220,38,38,0.12)',
    },
    {
      icon: <TrendingUp size={15} />,
      label: 'Mỗi ngày TB',
      value: avgPerDay > 0 ? formatShort(Math.round(avgPerDay)) : '—',
      sub: avgPerDay > 0 ? 'có chi tiêu' : 'Chưa có',
      color: 'var(--color-success)',
      bg: 'rgba(16,185,129,0.12)',
    },
  ]

  return (
    <div className="px-4 grid grid-cols-3 gap-2.5">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-[20px] p-3.5 border border-border/50 flex flex-col gap-2 bg-card"
          style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.2)' }}
        >
          {/* Icon */}
          <div
            className="size-7 rounded-full flex items-center justify-center"
            style={{ background: c.bg, color: c.color }}
          >
            {c.icon}
          </div>

          {/* Label */}
          <p className="text-[9px] font-black text-text-hint uppercase tracking-widest leading-none">
            {c.label}
          </p>

          {/* Value */}
          <div>
            <p
              className="font-num text-[16px] font-black tracking-tighter leading-none"
              style={{ color: c.color }}
            >
              {c.value}
              {c.value !== '—' && (
                <span className="text-[10px] font-medium opacity-60 ml-0.5">đ</span>
              )}
            </p>
            <p className="text-[9px] text-text-hint mt-0.5 font-medium truncate">{c.sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
