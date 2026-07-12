import { useMemo } from 'react'
import type { useDashboard } from '@/hooks/useDashboard'
import { CategoryIcon } from '@/components/CategoryIcon'
import { triggerHaptic } from '@/lib/haptic'
import { cn, formatShort, formatVND, tint } from '@/lib/utils'
import { useAppStore } from '@/stores/appStore'
import { motion } from 'framer-motion'
import { Activity, BarChart3, PieChart as PieChartIcon, TrendingDown, TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Tooltip as RechartsTooltip, ResponsiveContainer, XAxis } from 'recharts'
import { MoneyFlowCard } from './MoneyFlowCard'
import { StatCards } from './StatCards'


interface MonthlyTabProps {
  data: ReturnType<typeof useDashboard>
}

export function MonthlyTab({ data }: MonthlyTabProps) {
  const { dashboardChartMode: chartMode, setDashboardChartMode: setChartMode } = useAppStore()

  const { monthTotal, settings, donutData, last4MonthsBar, lastMonthTotal } = data

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

  const diff = monthTotal - lastMonthTotal
  const isIncrease = diff > 0

  const barData = last4MonthsBar

  const currentDay = new Date().getDate()
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const averageDaily = monthTotal / Math.max(1, currentDay)
  const forecastTotal = averageDaily * daysInMonth

  return (
    <div className="flex flex-col pb-32 pt-2 animate-in fade-in duration-150 mesh-gradient min-h-full">
      {/* Stat cards */}
      <div className="px-4 pt-2">
        <StatCards monthTotal={monthTotal} settings={settings} />
      </div>

      {/* Money-flow gauge: money in vs out vs kept */}
      <MoneyFlowCard monthTotal={monthTotal} settings={settings} />

      {/* Main Chart Card styled like the reference image */}
      <div className="mt-8 mx-4 rounded-[32px] bg-card shadow-[0_8px_32px_rgba(0,0,0,0.25)] border border-border/40 overflow-hidden mb-6">
        {/* Header & Pill Toggle */}
        <div className="flex flex-wrap items-start justify-between px-6 pt-6 pb-2 gap-y-3">
          <div className="flex flex-col pr-2">
            <span className="text-[14px] text-text-muted font-medium mb-1 tracking-tight">Chi tiêu tháng này</span>
            <span className={cn(
              "font-bold text-text font-num leading-none tracking-tight",
              formatVND(monthTotal).length > 10 ? "text-[18px]" : "text-[22px]"
            )}>
              {formatVND(monthTotal)}đ
            </span>
          </div>

          {/* D/W/M-style Pill Toggle but for our features */}
          <div className="inline-flex items-center bg-surface p-0.5 rounded-full shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.2)] border border-border/60">
            <button
              onClick={() => {
                triggerHaptic('light')
                setChartMode('trend')
              }}
              className="relative px-3 py-1.5 rounded-full text-[11px] font-bold z-10 transition-colors flex items-center gap-1.5"
            >
              <span className={chartMode === 'trend' ? "text-white flex items-center gap-1.5" : "text-text-muted hover:text-text transition-colors flex items-center gap-1.5"}>
                <BarChart3 size={13} strokeWidth={2.5} />
                <span className="hidden sm:inline">Xu hướng</span>
              </span>
              {chartMode === 'trend' && (
                <motion.div 
                  layoutId="activeTabBg" 
                  className="absolute inset-0 rounded-full -z-10 shadow-sm"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => {
                triggerHaptic('light')
                setChartMode('distribution')
              }}
              className="relative px-3 py-1.5 rounded-full text-[11px] font-bold z-10 transition-colors flex items-center gap-1.5"
            >
              <span className={chartMode === 'distribution' ? "text-white flex items-center gap-1.5" : "text-text-muted hover:text-text transition-colors flex items-center gap-1.5"}>
                <PieChartIcon size={13} strokeWidth={2.5} />
                <span className="hidden sm:inline">Cơ cấu</span>
              </span>
              {chartMode === 'distribution' && (
                <motion.div 
                  layoutId="activeTabBg" 
                  className="absolute inset-0 rounded-full -z-10 shadow-sm"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
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
                        <defs>
                          {/* Gentle top-to-bottom shading per slice (3D hint) */}
                          {chartSlices.map((d, i) => (
                            <linearGradient key={`donut-shade-${i}`} id={`donut-shade-${i}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={d.color} stopOpacity={1} />
                              <stop offset="100%" stopColor={d.color} stopOpacity={0.78} />
                            </linearGradient>
                          ))}
                          {/* Soft lift shadow for the ring */}
                          <filter id="donut-lift" x="-30%" y="-30%" width="160%" height="160%">
                            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000" floodOpacity="0.35" />
                          </filter>
                          {/* Heavy blur for the glow layer */}
                          <filter id="donut-glow" x="-40%" y="-40%" width="180%" height="180%">
                            <feGaussianBlur stdDeviation="10" />
                          </filter>
                        </defs>

                        {/* Blurred color glow behind the ring (depth) */}
                        <Pie
                          data={chartSlices}
                          cx="50%"
                          cy="50%"
                          innerRadius="70%"
                          outerRadius="94%"
                          paddingAngle={2}
                          dataKey="value"
                          cornerRadius={6}
                          stroke="none"
                          isAnimationActive={false}
                          style={{ outline: 'none', pointerEvents: 'none' }}
                        >
                          {chartSlices.map((d, i) => (
                            <Cell
                              key={`glow-${i}`}
                              fill={d.color}
                              opacity={0.35}
                              filter="url(#donut-glow)"
                              style={{ outline: 'none' }}
                            />
                          ))}
                        </Pie>

                        <RechartsTooltip
                          cursor={false}
                          // Must stack above the frosted-glass center disc
                          // overlay, or its backdrop-blur smears the tooltip
                          wrapperStyle={{ zIndex: 20 }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const item = payload[0].payload;
                              return (
                                <div className="bg-surface2/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-border flex items-center gap-2">
                                  <div className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                                  <span className="font-medium text-[13px] text-text">{item.name}</span>
                                  <span className="font-bold text-[13px] text-text">{formatVND(item.value)}đ</span>
                                </div>
                              )
                            }
                            return null;
                          }}
                        />
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
                          animationDuration={600}
                          style={{ outline: 'none' }}
                        >
                          {chartSlices.map((_d, i) => (
                            <Cell
                              key={`cell-${i}`}
                              fill={`url(#donut-shade-${i})`}
                              filter="url(#donut-lift)"
                              style={{ outline: 'none', cursor: 'default' }}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Frosted glass center disc */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="size-[132px] rounded-full bg-white/3 backdrop-blur-[3px] border border-white/6" />
                    </div>

                    {/* Center label overlay with dynamic font scaling */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingTop: '4px' }}>
                      <span className="text-[10px] font-black text-text-hint tracking-[0.2em] uppercase mb-1 opacity-60">Tổng cộng</span>
                      <div className="flex items-baseline justify-center w-full px-10">
                        {(() => {
                          const totalStr = formatVND(monthTotal);
                          const fontSize = totalStr.length > 12 ? '14px' : totalStr.length > 10 ? '17px' : totalStr.length > 8 ? '20px' : '22px';
                          return (
                            <>
                              <span 
                                className="font-black text-text font-num leading-tight tracking-tight text-center"
                                style={{ fontSize }}
                              >
                                {totalStr}
                              </span>
                              <span className="text-text-muted font-bold ml-0.5" style={{ fontSize: totalStr.length > 10 ? '11px' : '14px' }}>đ</span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Legend rows below chart */}
                  <div className="flex flex-col gap-2 px-4 mt-4">
                    {donutData.map((item) => {
                      const pct = monthTotal > 0 ? Math.round((item.value / monthTotal) * 100) : 0
                      return (
                        <div key={item.name} className="relative overflow-hidden flex items-center gap-3 py-2.5 px-3 rounded-2xl bg-surface2/60 border border-border/40 transition-transform active:scale-[0.98]">
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
                          <stop offset="0%" stopColor="#94A3B8" stopOpacity={0.45} />
                          <stop offset="100%" stopColor="#94A3B8" stopOpacity={0.12} />
                        </linearGradient>
                        <filter id="bar-shadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.08" />
                        </filter>
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
                          <text x={x} y={yNum + 12} fill={isCurrent ? '#F8FAFC' : '#94A3B8'} fontSize={12} fontWeight={isCurrent ? 700 : 500} textAnchor="middle" fontFamily="JetBrains Mono, monospace">
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
                              <span className="font-bold text-[14px]" style={{ color: isCurrent ? 'var(--color-accent-dark)' : '#fff' }}>
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
                    >
                      {barData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.isCurrentMonth ? "url(#bar-grad-active)" : "url(#bar-grad-inactive)"} 
                          filter="url(#bar-shadow)"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mx-2 mt-3 flex flex-col gap-2">
                {diff !== 0 && lastMonthTotal > 0 && (
                  <div
                    className="px-4 py-3 rounded-2xl flex items-center gap-3 transition-all active:scale-[0.98]"
                    style={{
                      background: isIncrease ? 'rgba(220,38,38,0.10)' : 'rgba(16,185,129,0.10)',
                      border: `1px solid ${isIncrease ? 'rgba(220,38,38,0.25)' : 'rgba(16,185,129,0.25)'}`
                    }}
                  >
                    <div
                      className="size-[34px] rounded-full flex items-center justify-center shrink-0 shadow-sm"
                      style={{ background: isIncrease ? 'rgba(220,38,38,0.18)' : 'rgba(16,185,129,0.18)' }}
                    >
                      {isIncrease ? <TrendingUp size={16} color="#F87171" /> : <TrendingDown size={16} color="#34D399" />}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-[12px] text-text-muted font-medium mb-[3px] leading-none">
                        {isIncrease ? 'Chi nhiều hơn tháng trước' : 'Bạn đã tiết kiệm được'}
                      </p>
                      <p 
                        className="font-num text-[16px] font-black leading-none"
                        style={{ color: isIncrease ? '#F87171' : '#34D399' }}
                      >
                        {formatVND(Math.abs(diff))}đ
                      </p>
                    </div>
                  </div>
                )}

                {monthTotal > 0 && (
                  <div className="px-4 py-3 rounded-2xl flex items-center gap-3 bg-surface/50 border border-border/40 transition-all active:scale-[0.98]">
                    <div className="size-[34px] rounded-full bg-surface2 flex items-center justify-center shrink-0 shadow-sm border border-border/20 text-(--color-accent-dark)">
                      <Activity size={16} />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-[12px] text-text-muted font-medium mb-[3px] leading-none uppercase tracking-widest text-[10px]">Dự báo chi tiêu</p>
                      <p className="font-num text-[16px] font-black leading-none text-text">
                        ~{formatShort(forecastTotal)} <span className="text-[11px] font-bold text-text-muted">tháng này</span>
                      </p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-text-hint font-bold uppercase tracking-tight mb-0.5">Trung bình</p>
                       <p className="text-[13px] font-black text-(--color-accent-dark) font-num leading-none">{formatShort(averageDaily)}/n</p>
                    </div>
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
