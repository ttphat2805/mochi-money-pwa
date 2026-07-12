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

/**
 * Arc path between two fractions (0..1) of the semicircle.
 * The large-arc flag stays 0: a fraction span maps to at most a 180° sweep,
 * so the "large" (>180°) arc is never the right choice — setting it for
 * spans > 0.5 made renderers draw the long way around the circle (the
 * deformed ghost ring seen on mobile).
 */
function arcPath(from: number, to: number) {
  const start = polar(180 + from * 180)
  const end = polar(180 + to * 180)
  return `M ${start.x} ${start.y} A ${R} ${R} 0 0 1 ${end.x} ${end.y}`
}

/**
 * The full background track sweeps exactly 180°, where the arc flag is
 * genuinely ambiguous (both candidate arcs are equal length) and renderers
 * disagree. Split into two unambiguous 90° halves.
 */
const TRACK_PATH = `${arcPath(0, 0.5)} ${arcPath(0.5, 1)}`

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
          <div className="flex justify-center mb-3">
            <svg viewBox="0 0 220 128" className="w-[240px] max-w-full" role="img"
              aria-label={`Đã chi ${Math.round(spentPct * 100)}% thu nhập tháng này`}>
              {/* Track */}
              <path d={TRACK_PATH} fill="none" stroke="rgba(255,255,255,0.08)"
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

              {/* Progress knob riding the arc at the spent/kept boundary.
                  Drawn at the arc's start and rotated into place around the
                  center, so it always sits exactly on the ring. */}
              <motion.g
                style={{ transformOrigin: `${CX}px ${CY}px` }}
                initial={{ rotate: 0 }}
                animate={{ rotate: spentPct * 180 }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.8, delay: 0.15 }}
              >
                <circle cx={CX - R} cy={CY} r={11} fill="var(--color-card)" />
                <circle cx={CX - R} cy={CY} r={9} fill="#F8FAFC" />
                <circle cx={CX - R} cy={CY} r={4} fill={COLOR_OUT} />
              </motion.g>

              {/* Center readout inside the arch */}
              <text x={CX} y={CY - 14} textAnchor="middle" fill="var(--color-text)"
                fontSize="30" fontWeight="800" className="font-num">
                {Math.round(spentPct * 100)}%
              </text>
              <text x={CX} y={CY + 6} textAnchor="middle" fill="var(--color-text-muted)"
                fontSize="11" fontWeight="500">
                thu nhập đã chi
              </text>
            </svg>
          </div>

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
