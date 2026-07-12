import { db } from '@/lib/db'
import { formatShort, getCurrentMonthString } from '@/lib/utils'
import type { FinancialSettings } from '@/types'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion } from 'framer-motion'
import { Wallet } from 'lucide-react'

// Gauge geometry — semicircle from 180° (left) to 360° (right)
const CX = 110
const CY = 112
const R = 86
const STROKE = 15

const COLOR_OUT = '#F87171' // money out
const COLOR_IN = '#60A5FA' // money in
const COLOR_SAVE = '#FBBF24' // kept / savings

function polar(deg: number) {
  const rad = (deg * Math.PI) / 180
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) }
}

/** Arc path between two fractions (0..1) of the semicircle */
function arcPath(from: number, to: number) {
  const start = polar(180 + from * 180)
  const end = polar(180 + to * 180)
  const largeArc = to - from > 0.5 ? 1 : 0
  return `M ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

interface MoneyFlowCardProps {
  monthTotal: number
  settings: FinancialSettings | null
}

/**
 * Month money-flow gauge: how much of this month's income (salary + extra
 * incomes) has gone out, and how much is still kept. The needle points at
 * the spent fraction.
 */
export function MoneyFlowCard({ monthTotal, settings }: MoneyFlowCardProps) {
  const monthKey = getCurrentMonthString()

  const extraIncomes = useLiveQuery(
    () => db.extraIncomes.where('monthKey').equals(monthKey).toArray(),
    [monthKey],
  ) ?? []

  const moneyIn = (settings?.income ?? 0) + extraIncomes.reduce((s, e) => s + e.amount, 0)
  const moneyOut = monthTotal
  const savings = Math.max(0, moneyIn - moneyOut)
  const spentPct = moneyIn > 0 ? Math.min(1, moneyOut / moneyIn) : 0

  return (
    <div className="mx-4 mt-4 rounded-[28px] bg-card border border-border/40 shadow-[0_8px_32px_rgba(0,0,0,0.25)] p-5">
      <p className="text-[14px] text-text-muted font-medium tracking-tight mb-1">
        Dòng tiền tháng này
      </p>

      {moneyIn <= 0 ? (
        // No income configured yet — gauge has nothing to compare against
        <div className="flex items-center gap-3 py-4">
          <div className="size-10 rounded-xl bg-surface2 flex items-center justify-center shrink-0">
            <Wallet size={18} className="text-text-muted" />
          </div>
          <p className="text-[13px] text-text-muted leading-relaxed">
            Thêm thu nhập hằng tháng trong <span className="font-semibold text-text">Cài đặt tài chính</span> để
            xem tiền vào, tiền ra và phần giữ lại được.
          </p>
        </div>
      ) : (
        <>
          {/* Gauge */}
          <div className="flex justify-center">
            <svg viewBox="0 0 220 128" className="w-[240px] max-w-full" role="img"
              aria-label={`Đã chi ${Math.round(spentPct * 100)}% thu nhập tháng này`}>
              {/* Track */}
              <path d={arcPath(0, 1)} fill="none" stroke="rgba(255,255,255,0.08)"
                strokeWidth={STROKE} strokeLinecap="round" />

              {/* Kept portion (drawn under the spent arc) */}
              {spentPct < 1 && (
                <motion.path
                  d={arcPath(Math.max(spentPct, 0.001), 1)}
                  fill="none" stroke={COLOR_SAVE} strokeOpacity={0.85}
                  strokeWidth={STROKE} strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.25 }}
                />
              )}

              {/* Spent portion */}
              {spentPct > 0 && (
                <motion.path
                  d={arcPath(0, Math.max(spentPct, 0.02))}
                  fill="none" stroke={COLOR_OUT}
                  strokeWidth={STROKE} strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              )}

              {/* Needle */}
              <motion.g
                style={{ transformOrigin: `${CX}px ${CY}px` }}
                initial={{ rotate: 0 }}
                animate={{ rotate: spentPct * 180 }}
                transition={{ type: 'spring', bounce: 0.25, duration: 0.9, delay: 0.15 }}
              >
                <line x1={CX - 18} y1={CY} x2={CX - R + 26} y2={CY}
                  stroke="#F8FAFC" strokeWidth={4} strokeLinecap="round" />
              </motion.g>
              <circle cx={CX} cy={CY} r={11} fill={COLOR_IN} />
              <circle cx={CX} cy={CY} r={4.5} fill="#F8FAFC" />
            </svg>
          </div>

          {/* Center caption */}
          <p className="text-center font-num text-[13px] text-text-muted -mt-1 mb-4">
            <span className="text-[16px] font-black text-text">{Math.round(spentPct * 100)}%</span>{' '}
            thu nhập đã chi
          </p>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Tiền ra', value: moneyOut, color: COLOR_OUT },
              { label: 'Tiền vào', value: moneyIn, color: COLOR_IN },
              { label: 'Giữ lại', value: savings, color: COLOR_SAVE },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px] font-medium text-text-muted">{item.label}</span>
                </div>
                <span className="font-num text-[15px] font-black text-text tracking-tight">
                  {formatShort(item.value)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
