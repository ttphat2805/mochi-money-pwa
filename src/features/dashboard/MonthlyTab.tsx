import { useMemo } from 'react'
import type { useDashboard } from '@/hooks/useDashboard'
import { CategoryIcon } from '@/components/CategoryIcon'
import { triggerHaptic } from '@/lib/haptic'
import { FORECAST_MIN_DAYS, getSpendingForecast } from '@/lib/budget'
import { cn, formatShort, formatVND, getDaysInMonth, getTodayString, tint } from '@/lib/utils'
import { useAppStore } from '@/stores/appStore'
import { motion } from 'framer-motion'
import { Activity, BarChart3, PieChart as PieChartIcon, TrendingDown, TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Tooltip as RechartsTooltip, ResponsiveContainer, XAxis } from 'recharts'
import { MoneyFlowCard } from './MoneyFlowCard'
import { StatCards } from './StatCards'

/** Chart mount animation — short so it never competes with scrolling */
const CHART_ANIM_MS = 400

const CHART_MODES = [
  { id: 'trend', label: 'Xu hướng', title: 'Chi tiêu 4 tháng gần đây', Icon: BarChart3 },
  { id: 'distribution', label: 'Cơ cấu', title: 'Cơ cấu chi tiêu tháng này', Icon: PieChartIcon },
] as const

interface MonthlyTabProps {
  data: ReturnType<typeof useDashboard>
}

export function MonthlyTab({ data }: MonthlyTabProps) {
  const { dashboardChartMode: chartMode, setDashboardChartMode: setChartMode } = useAppStore()

  const {
    monthTotal, settings, donutData, last4MonthsBar,
    lastMonthSamePeriodTotal, extraIncome, monthlyBudget,
  } = data

  // Donut readability: slivers under 3% become confetti on a thin ring, so
  // group them into one muted "Khác" slice. The legend below still lists
  // every category individually.
  const chartSlices = useMemo(() => {
    if (monthTotal <= 0) return donutData
    const small = donutData.filter((d) => d.value / monthTotal < 0.03)
    if (small.length < 2) return donutData
    return [
      ...donutData.filter((d) => d.value / monthTotal >= 0.03),
      {
        name: 'Khác',
        value: small.reduce((s, d) => s + d.value, 0),
        color: '#64748B',
        icon: 'package',
        pct: Math.round((small.reduce((s, d) => s + d.value, 0) / monthTotal) * 100),
      },
    ]
  }, [donutData, monthTotal])

  // Month-to-date vs last month's same period (day 1 … same day)
  const diff = monthTotal - lastMonthSamePeriodTotal
  const isIncrease = diff > 0

  const barData = last4MonthsBar

  // ── Forecast (hidden until enough days have elapsed) ──────────
  const [yr, mo, currentDay] = getTodayString().split('-').map(Number)
  const daysInMonth = getDaysInMonth(yr, mo)
  const forecast = getSpendingForecast(
    monthTotal,
    currentDay,
    daysInMonth,
    settings?.income ? monthlyBudget : 0,
  )
  const activeMode = CHART_MODES.find((m) => m.id === chartMode) ?? CHART_MODES[0]

  return (
    <div className="flex flex-col pb-32 pt-2 animate-in fade-in duration-150 mesh-gradient min-h-full">
      {/* Stat cards */}
      <div className="px-4 pt-2">
        <StatCards
          monthTotal={monthTotal}
          settings={settings}
          extraIncome={extraIncome}
          monthlyBudget={monthlyBudget}
        />
      </div>

      {/* Money-flow gauge: money in vs out vs kept */}
      <MoneyFlowCard monthTotal={monthTotal} settings={settings} extraIncome={extraIncome} />

      {/* Main Chart Card styled like the reference image */}
      <div className="mt-8 mx-4 rounded-[32px] bg-card shadow-[0_8px_32px_rgba(0,0,0,0.25)] border border-border/40 overflow-hidden mb-6">
        {/* Header & Pill Toggle — the month total already shows in the
            stat cards, so the header only names the active chart */}
        <div className="flex flex-wrap items-center justify-between px-6 pt-6 pb-2 gap-y-3">
          <h2 className="text-[14px] text-text-muted font-medium tracking-tight pr-2">
            {activeMode.title}
          </h2>

          <div
            role="tablist"
            aria-label="Kiểu biểu đồ"
            className="inline-flex items-center bg-surface p-0.5 rounded-full shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.2)] border border-border/60"
          >
            {CHART_MODES.map(({ id, label, Icon }) => {
              const isActive = chartMode === id
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    if (isActive) return
                    triggerHaptic('light')
                    setChartMode(id)
                  }}
                  className="relative px-3 py-1.5 rounded-full text-[11px] font-bold z-10 transition-colors flex items-center gap-1.5"
                >
                  <span className={cn('flex items-center gap-1.5 transition-colors', isActive ? 'text-white' : 'text-text-muted')}>
                    <Icon size={13} strokeWidth={2.5} aria-hidden />
                    {label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 rounded-full -z-10 shadow-sm bg-accent"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="px-2 pb-6 pt-2">
          {/* Distribution — donut */}
          {chartMode === 'distribution' && (
            <div className="animate-in fade-in duration-300 pb-4 pt-2">
              {donutData.length > 0 ? (
                <>
                  {/* Full-width donut chart */}
                  <div className="relative w-full h-[220px] mx-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart style={{ outline: 'none' }}>
                        <RechartsTooltip
                          cursor={false}
                          wrapperStyle={{ zIndex: 20 }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const item = payload[0].payload;
                              return (
                                <div className="bg-surface2 px-3 py-2 rounded-xl shadow-lg border border-border flex items-center gap-2">
                                  <div className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                                  <span className="font-medium text-[13px] text-text">{item.name}</span>
                                  <span className="font-bold text-[13px] text-text">{formatVND(item.value)}đ</span>
                                </div>
                              )
                            }
                            return null;
                          }}
                        />
                        {/* Flat colours only: SVG blur/shadow filters under a
                            backdrop-blur were janky on iOS */}
                        <Pie
                          data={chartSlices}
                          cx="50%"
                          cy="50%"
                          innerRadius="72%"
                          outerRadius="92%"
                          paddingAngle={2}
                          dataKey="value"
                          cornerRadius={6}
                          stroke="none"
                          isAnimationActive={true}
                          animationBegin={0}
                          animationDuration={CHART_ANIM_MS}
                          style={{ outline: 'none' }}
                        >
                          {chartSlices.map((d, i) => (
                            <Cell
                              key={`cell-${i}`}
                              fill={d.color}
                              style={{ outline: 'none', cursor: 'default' }}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Center label overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingTop: '4px' }}>
                      <span className="text-[10px] font-black text-text-hint tracking-[0.2em] uppercase mb-1">Tổng cộng</span>
                      <span className="font-black text-text font-num leading-tight tracking-tight text-[24px]">
                        {formatShort(monthTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Legend rows below chart */}
                  <div className="flex flex-col gap-2 px-4 mt-4">
                    {donutData.map((item) => {
                      const pct = monthTotal > 0 ? Math.round((item.value / monthTotal) * 100) : 0
                      return (
                        <div key={item.name} className="relative overflow-hidden flex items-center gap-3 py-2.5 px-3 rounded-2xl bg-surface2/60 border border-border/40">
                          {/* Proportional fill behind the row */}
                          <div
                            className="absolute inset-y-0 left-0 rounded-2xl pointer-events-none"
                            style={{ width: `${pct}%`, background: tint(item.color, 7) }}
                          />
                          {/* Category icon chip */}
                          <div
                            className="relative size-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: tint(item.color, 12) }}
                          >
                            <CategoryIcon icon={item.icon} size={16} color={item.color} />
                          </div>
                          {/* Name */}
                          <span className="relative text-[14px] text-text font-bold flex-1 truncate">{item.name}</span>
                          {/* Amount */}
                          <span className="relative font-num text-[14px] font-bold text-text-muted shrink-0 opacity-80">{formatShort(item.value)}</span>
                          {/* Percentage badge */}
                          <span
                            className="relative font-num text-[13px] font-black shrink-0 min-w-[36px] text-right"
                            style={{ color: item.color }}
                          >
                            {pct}%
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-[13px] text-text-muted font-medium">
                  Chưa có chi tiêu tháng này
                </div>
              )}
            </div>
          )}

          {/* Trend — bar */}
          {chartMode === 'trend' && (
            <div className="animate-in fade-in zoom-in-95 duration-300 pt-2 pb-2 px-2 relative">
              <div className="h-[210px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 24, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="bar-grad-active" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={1} />
                          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.6} />
                        </linearGradient>
                        <linearGradient id="bar-grad-inactive" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-text-muted)" stopOpacity={0.45} />
                          <stop offset="100%" stopColor="var(--color-text-muted)" stopOpacity={0.12} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.07)" />
                    <XAxis 
                      dataKey="monthLabel" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={({ x, y, payload }) => {
                        const yNum = typeof y === 'number' ? y : Number(y)
                        const isCurrent = payload.value === barData.find(d => d.isCurrentMonth)?.monthLabel
                        return (
                          <text x={x} y={yNum + 12} fill={isCurrent ? 'var(--color-text)' : 'var(--color-text-muted)'} fontSize={12} fontWeight={isCurrent ? 700 : 500} textAnchor="middle" fontFamily="JetBrains Mono, monospace">
                            {payload.value}
                          </text>
                        )
                      }} 
                    />
                    <RechartsTooltip 
                      cursor={{ fill: 'transparent' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const isCurrent = data.isCurrentMonth;
                          return (
                            <div className="bg-surface2 border border-border px-3 py-2 rounded-xl shadow-lg flex flex-col gap-0.5">
                              <span className="text-[10px] text-text-muted">{data.monthLabel}</span>
                              <span className="font-bold text-[14px]" style={{ color: isCurrent ? 'var(--color-accent-dark)' : 'var(--color-text)' }}>
                                {formatVND(data.amount)}đ
                              </span>
                            </div>
                          )
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="amount" 
                      radius={[8, 8, 8, 8]}
                      barSize={32}
                      activeBar={false}
                      isAnimationActive={true}
                      animationDuration={CHART_ANIM_MS}
                    >
                      {barData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.isCurrentMonth ? "url(#bar-grad-active)" : "url(#bar-grad-inactive)"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mx-2 mt-3 flex flex-col gap-2">
                {diff !== 0 && lastMonthSamePeriodTotal > 0 && (
                  <div
                    className={cn(
                      'px-4 py-3 rounded-2xl flex items-center gap-3 border',
                      isIncrease ? 'bg-danger-bg border-danger/25' : 'bg-success-bg border-success/25',
                    )}
                  >
                    <div
                      className={cn(
                        'size-[34px] rounded-full flex items-center justify-center shrink-0',
                        isIncrease ? 'bg-danger-bg text-danger' : 'bg-success-bg text-success',
                      )}
                    >
                      {isIncrease ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-[12px] text-text-muted font-medium mb-[3px] leading-tight">
                        {isIncrease ? 'Chi nhiều hơn' : 'Chi ít hơn'} so với cùng kỳ tháng trước
                      </p>
                      <p className={cn('font-num text-[16px] font-black leading-none', isIncrease ? 'text-danger' : 'text-success')}>
                        {isIncrease ? '+' : '-'}{formatShort(Math.abs(diff))}
                      </p>
                    </div>
                  </div>
                )}

                {monthTotal > 0 && (
                  <div className="px-4 py-3 rounded-2xl flex items-center gap-3 bg-surface/50 border border-border/40">
                    <div className="size-[34px] rounded-full bg-surface2 flex items-center justify-center shrink-0 shadow-sm border border-border/20 text-accent-dark">
                      <Activity size={16} />
                    </div>
                    {forecast ? (
                      <>
                        <div className="flex-1 flex flex-col justify-center min-w-0">
                          <p className="text-text-muted font-medium mb-[3px] leading-none uppercase tracking-widest text-[10px]">Dự báo chi tiêu</p>
                          <p className="font-num text-[16px] font-black leading-none text-text">
                            ~{formatShort(forecast.projectedTotal)} <span className="text-[11px] font-bold text-text-muted">tháng này</span>
                          </p>
                          {forecast.vsBudget != null && (
                            <p className={cn('text-[11px] font-semibold mt-1 leading-tight', forecast.vsBudget > 0 ? 'text-danger' : 'text-success')}>
                              {forecast.vsBudget > 0
                                ? `Dự kiến vượt ngân sách ${formatShort(forecast.vsBudget)}`
                                : `Trong ngân sách · dư ~${formatShort(-forecast.vsBudget)}`}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-text-hint font-bold uppercase tracking-tight mb-0.5">Trung bình</p>
                          <p className="text-[13px] font-black text-accent-dark font-num leading-none">{formatShort(forecast.dailyAverage)}/ngày</p>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col justify-center">
                        <p className="text-text-muted font-medium mb-[3px] leading-none uppercase tracking-widest text-[10px]">Dự báo chi tiêu</p>
                        <p className="text-[13px] font-semibold text-text leading-tight">Chưa đủ dữ liệu dự báo</p>
                        <p className="text-[11px] text-text-hint leading-tight mt-0.5">
                          Cần ít nhất {FORECAST_MIN_DAYS} ngày trong tháng
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
