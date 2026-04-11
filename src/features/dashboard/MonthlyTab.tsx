import { motion } from 'framer-motion'
import { BarChart3, PieChart as PieChartIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, CartesianGrid } from 'recharts'
import { formatVND, formatShort } from '@/lib/utils'
import { triggerHaptic } from '@/lib/haptic'
import { StatCards } from './StatCards'
import type { useDashboard } from '@/hooks/useDashboard'
import { useAppStore } from '@/stores/appStore'


interface MonthlyTabProps {
  data: ReturnType<typeof useDashboard>
}

export function MonthlyTab({ data }: MonthlyTabProps) {
  const { dashboardChartMode: chartMode, setDashboardChartMode: setChartMode } = useAppStore()

  const { monthTotal, settings, donutData, last4MonthsBar, lastMonthTotal } = data

  const diff = monthTotal - lastMonthTotal
  const isIncrease = diff > 0

  const barData = last4MonthsBar

  return (
    <div className="flex flex-col pb-32 pt-2 animate-in fade-in duration-150 mesh-gradient min-h-full">
      {/* Stat cards */}
      <div className="px-4 pt-2">
        <StatCards monthTotal={monthTotal} settings={settings} />
      </div>



      {/* Main Chart Card styled like the reference image */}
      <div className="mt-8 mx-4 rounded-[32px] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-border/40 overflow-hidden mb-6">
        {/* Header & Pill Toggle */}
        <div className="flex flex-wrap items-start justify-between px-6 pt-6 pb-2 gap-y-3">
          <div className="flex flex-col pr-2">
            <span className="text-[14px] text-text-muted font-medium mb-1 tracking-tight">Chi tiêu tháng này</span>
            <span className="text-[22px] font-bold text-text font-num leading-none">{formatVND(monthTotal)}đ</span>
          </div>

          {/* D/W/M-style Pill Toggle but for our features */}
          <div className="inline-flex items-center bg-surface p-0.5 rounded-full shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-border/60">
            <button
              onClick={() => {
                triggerHaptic('light')
                setChartMode('trend')
              }}
              className="relative px-3 py-1.5 rounded-full text-[11px] font-bold z-10 transition-colors flex items-center gap-1.5"
            >
              <span className={chartMode === 'trend' ? "text-white flex items-center gap-1.5" : "text-text-muted hover:text-text transition-colors flex items-center gap-1.5"}>
                <BarChart3 size={13} strokeWidth={2.5} />
                <span>Xu hướng</span>
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
                <span>Cơ cấu</span>
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
            <div className="animate-in fade-in zoom-in-95 duration-300 pb-4 pt-2">
              {donutData.length > 0 ? (
                <>
                  {/* Full-width donut chart */}
                  <div className="relative w-full h-[220px] mx-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart style={{ outline: 'none' }}>
                        <defs>
                          {donutData.map((d, i) => {
                            const gradId = `pie-grad-${i}`;
                            return (
                              <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={d.color} stopOpacity={1} />
                                <stop offset="100%" stopColor={d.color} stopOpacity={0.72} />
                              </linearGradient>
                            );
                          })}
                          <filter id="pie-shadow" x="-30%" y="-30%" width="160%" height="160%">
                            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.1" />
                          </filter>
                        </defs>
                        <RechartsTooltip
                          cursor={false}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const item = payload[0].payload;
                              return (
                                <div className="bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-border flex items-center gap-2">
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
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius="55%"
                          outerRadius="82%"
                          paddingAngle={5}
                          dataKey="value"
                          cornerRadius={12}
                          stroke="none"
                          isAnimationActive={true}
                          animationBegin={0}
                          animationDuration={600}
                          style={{ outline: 'none' }}
                        >
                          {donutData.map((_d, i) => (
                            <Cell
                              key={`cell-${i}`}
                              fill={`url(#pie-grad-${i})`}
                              filter="url(#pie-shadow)"
                              style={{ outline: 'none', cursor: 'default' }}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Center label overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[9px] font-bold text-text-hint tracking-widest uppercase mb-0.5">Tổng cộng</span>
                      <div className="flex items-baseline gap-[1px]">
                        <span className="text-[18px] font-black text-text font-num leading-tight tracking-tight">{formatVND(monthTotal)}</span>
                        <span className="text-[12px] text-text-muted font-bold">đ</span>
                      </div>
                    </div>
                  </div>

                  {/* Legend rows below chart */}
                  <div className="flex flex-col gap-2 px-4 mt-4">
                    {donutData.map((item) => {
                      const pct = monthTotal > 0 ? Math.round((item.value / monthTotal) * 100) : 0
                      return (
                        <div key={item.name} className="flex items-center gap-3 py-2.5 px-3 rounded-2xl bg-surface/60 hover:bg-surface transition-colors">
                          {/* Color dot */}
                          <div
                            className="size-3 rounded-full shrink-0 shadow-sm"
                            style={{ background: item.color }}
                          />
                          {/* Name */}
                          <span className="text-[13px] text-text font-medium flex-1 truncate">{item.name}</span>
                          {/* Amount */}
                          <span className="font-num text-[13px] font-bold text-text shrink-0 opacity-80">{formatShort(item.value)}</span>
                          {/* Percentage badge */}
                          <span
                            className="font-num text-[12px] font-black shrink-0 min-w-[36px] text-right"
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
                          <stop offset="0%" stopColor="#C9C9C4" stopOpacity={0.7} />
                          <stop offset="100%" stopColor="#E2E2DF" stopOpacity={0.3} />
                        </linearGradient>
                        <filter id="bar-shadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.08" />
                        </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E5E5E0" />
                    <XAxis 
                      dataKey="monthLabel" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={({ x, y, payload }) => {
                        const yNum = typeof y === 'number' ? y : Number(y)
                        const isCurrent = payload.value === barData.find(d => d.isCurrentMonth)?.monthLabel
                        return (
                          <text x={x} y={yNum + 12} fill={isCurrent ? '#1A1A18' : '#88887A'} fontSize={12} fontWeight={isCurrent ? 700 : 500} textAnchor="middle" fontFamily="JetBrains Mono, monospace">
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
                            <div className="bg-[#1A1A18] px-3 py-2 rounded-xl shadow-lg flex flex-col gap-0.5">
                              <span className="text-[10px] text-[#88887A]">{data.monthLabel}</span>
                              <span className="font-bold text-[14px]" style={{ color: isCurrent ? 'var(--color-accent)' : '#fff' }}>
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
              
              {diff !== 0 && lastMonthTotal > 0 && (
                <div
                  className="mx-2 mt-3 px-4 py-3 rounded-2xl flex items-center gap-3"
                  style={{
                    background: isIncrease ? '#FFF5F5' : '#F2FCF7',
                    border: `1px solid ${isIncrease ? '#FFE5E5' : '#E4F7ED'}`
                  }}
                >
                  <div 
                    className="size-[34px] rounded-full flex items-center justify-center shrink-0 shadow-sm"
                    style={{ background: isIncrease ? '#FFE5E5' : '#E4F7ED' }}
                  >
                    {isIncrease ? <TrendingUp size={16} color="#D63E3E" /> : <TrendingDown size={16} color="var(--color-success)" />}
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-[12px] text-text-muted font-medium mb-[3px] leading-none">
                      {isIncrease ? 'Chi nhiều hơn tháng trước' : 'Bạn đã tiết kiệm được'}
                    </p>
                    <p 
                      className="font-num text-[16px] font-black leading-none"
                      style={{ color: isIncrease ? '#D63E3E' : 'var(--color-success)' }}
                    >
                      {formatVND(Math.abs(diff))}đ
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
