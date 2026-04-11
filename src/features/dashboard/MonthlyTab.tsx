import { lazy, Suspense, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, BarChart3, PieChart } from 'lucide-react'
import { formatVND, formatShort } from '@/lib/utils'
import { triggerHaptic } from '@/lib/haptic'
import { StatCards } from './StatCards'
import type { useDashboard } from '@/hooks/useDashboard'
import { useAppStore } from '@/stores/appStore'

const ReactApexChart = lazy(() => import('react-apexcharts'))

interface MonthlyTabProps {
  data: ReturnType<typeof useDashboard>
}

const ChartSkeleton = ({ height = 220 }: { height?: number }) => (
  <div
    className="bg-surface rounded-2xl animate-pulse mx-0"
    style={{ height }}
  />
)
export function MonthlyTab({ data }: MonthlyTabProps) {
  const { dashboardChartMode: chartMode, setDashboardChartMode: setChartMode } = useAppStore()

  const { monthTotal, settings, donutData, last4MonthsBar, lastMonthTotal } = data

  const diff = monthTotal - lastMonthTotal
  const isIncrease = diff > 0

  // ── Bar chart options ──────────────────────────────────────────

  const barData = last4MonthsBar

  const barOptions = useMemo((): ApexCharts.ApexOptions => ({
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent',
      animations: {
        enabled: true,
        speed: 600,
        animateGradually: { enabled: true, delay: 100 },
        dynamicAnimation: { enabled: true, speed: 400 },
      },
      dropShadow: {
        enabled: false,
      },
    },

    plotOptions: {
      bar: {
        borderRadius: 8,
        borderRadiusApplication: 'end',
        columnWidth: '40%',
        dataLabels: { position: 'top' },
        distributed: true,
      },
    },

    fill: { opacity: 1 },

    colors: barData.map(d =>
      d.isCurrentMonth ? 'var(--color-accent)' : 'var(--color-text-hint)'
    ),

    dataLabels: {
      enabled: true,
      formatter: (val: number) => val > 0 ? formatShort(val) : '',
      offsetY: -32,
      style: {
        fontSize: '11px',
        fontWeight: 700,
        fontFamily: 'JetBrains Mono, monospace',
        colors: barData.map(d => d.isCurrentMonth ? 'var(--color-accent)' : 'var(--color-text-hint)'),
      },
      background: {
        enabled: true,
        foreColor: '#FFF',
        padding: 4,
        borderRadius: 6,
        borderWidth: 0,
        opacity: 1,
        dropShadow: { enabled: false },
      },
    },

    xaxis: {
      categories: barData.map(d => d.monthLabel),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'JetBrains Mono, monospace',
          colors: barData.map(d => d.isCurrentMonth ? '#1A1A18' : '#88887A'),
          fontWeight: 600,
        },
        offsetY: 4,
      },
    },

    yaxis: { show: false, max: (max) => max * 1.3 },

    grid: {
      show: true,
      borderColor: '#F0EDE8',
      strokeDashArray: 5,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
      padding: { top: 24, right: 8, bottom: 0, left: 8 },
    },

    tooltip: {
      enabled: true,
      theme: 'dark',
      style: { fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' },
      y: { formatter: (val: number) => formatVND(val) + 'đ' },
      marker: { show: false },
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const val = series[seriesIndex][dataPointIndex]
        const label = w.globals.labels[dataPointIndex]
        const isCurrent = barData[dataPointIndex]?.isCurrentMonth
        return `
          <div style="
            background: #1A1A18;
            border-radius: 10px;
            padding: 8px 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
          ">
            <div style="font-size: 10px; color: #88887A; margin-bottom: 2px;">${label}</div>
            <div style="font-size: 14px; font-weight: 700; color: ${isCurrent ? 'var(--color-accent)' : '#fff'};">
              ${formatVND(val)}đ
            </div>
          </div>
        `
      },
    },

    states: {
      // @ts-expect-error ApexCharts types are incomplete
      hover: { filter: { type: 'darken', value: 0.88 } },
      // @ts-expect-error ApexCharts types are incomplete
      active: { filter: { type: 'darken', value: 0.82 } },
    },
  }), [barData])

  const barSeries = useMemo(() => [{
    name: 'Chi tiêu',
    data: barData.map(d => d.amount),
  }], [barData])

  // ── Donut chart options ────────────────────────────────────────

  const donutOptions = useMemo((): ApexCharts.ApexOptions => ({
    chart: {
      type: 'donut',
      fontFamily: 'inherit',
      animations: {
        enabled: true,
        speed: 500,
        animateGradually: { enabled: true, delay: 100 },
      },
      dropShadow: {
        enabled: false,
      },
    },
    colors: donutData.map(d => d.color),
    labels: donutData.map(d => d.name),
    plotOptions: {
      pie: {
        donut: {
          size: '62%',
          background: 'transparent',
          labels: {
            show: true,
            name: { show: false },
            value: {
              show: true,
              fontSize: '18px',
              fontWeight: '700',
              color: '#1A1A18',
              fontFamily: 'JetBrains Mono, monospace',
              offsetY: 8,
              formatter: () => `${formatShort(monthTotal)}đ`,
            },
            total: {
              show: true,
              showAlways: true,
              label: '',
              formatter: () => `${formatShort(monthTotal)}đ`,
            },
          },
        },
        expandOnClick: false,
        customScale: 1,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: { width: 4, colors: ['#FFFFFF'] },
    legend: { show: false },
    tooltip: {
      y: { formatter: (val: number) => `${formatVND(val)}đ` },
      theme: 'dark',
    },
    states: {
      // @ts-expect-error ApexCharts types are incomplete
      hover: { filter: { type: 'darken', value: 0.85 } },
      active: {
        allowMultipleDataPointsSelection: false,
        // @ts-expect-error ApexCharts types are incomplete
        filter: { type: 'darken', value: 0.8 },
      },
    },
  }), [donutData, monthTotal])

  const donutSeries = useMemo(() => donutData.map(d => d.value), [donutData])

  return (
    <div className="flex flex-col pb-32 pt-2 animate-in fade-in duration-150 mesh-gradient min-h-full">
      {/* Stat cards */}
      <div className="px-4 pt-2">
        <StatCards monthTotal={monthTotal} settings={settings} />
      </div>



      {/* Main Chart Card styled like the reference image */}
      <div className="mt-8 mx-4 rounded-[32px] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-border/40 overflow-hidden mb-6">
        {/* Header & Pill Toggle */}
        <div className="flex items-start justify-between px-6 pt-6 pb-2">
          <div className="flex flex-col">
            <span className="text-[14px] text-text-muted font-medium mb-1 tracking-tight">Chi tiêu tháng này</span>
            <span className="text-[22px] font-bold text-text font-num leading-none">{formatVND(monthTotal)}đ</span>
          </div>

          {/* D/W/M-style Pill Toggle but for our features */}
          <div className="flex items-center bg-surface p-1 rounded-full shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-border/60">
            <button
              onClick={() => {
                triggerHaptic('light')
                setChartMode('trend')
              }}
              className="relative px-3.5 py-1.5 rounded-full text-[12px] font-semibold z-10 transition-colors flex items-center gap-1.5"
            >
              <span className={chartMode === 'trend' ? "text-white flex items-center gap-1.5" : "text-text-muted hover:text-text transition-colors flex items-center gap-1.5"}>
                <BarChart3 size={14} strokeWidth={2.5} />
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
              className="relative px-3.5 py-1.5 rounded-full text-[12px] font-semibold z-10 transition-colors flex items-center gap-1.5"
            >
              <span className={chartMode === 'distribution' ? "text-white flex items-center gap-1.5" : "text-text-muted hover:text-text transition-colors flex items-center gap-1.5"}>
                <PieChart size={14} strokeWidth={2.5} />
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
            donutData.length === 0 ? (
              <div className="flex items-center justify-center h-[280px] text-[13px] text-text-muted font-medium">
                Chưa có chi tiêu tháng này
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <div className="h-[250px] flex items-center justify-center px-4">
                  <Suspense fallback={<ChartSkeleton height={250} />}>
                    <ReactApexChart
                      type="donut"
                      options={donutOptions}
                      series={donutSeries}
                      height="100%"
                      width="100%"
                    />
                  </Suspense>
                </div>

                {/* Legend matching the tabular image design */}
                <div className="flex flex-col gap-3 px-6 mt-4">
                  {donutData.map((item) => {
                    const pct = monthTotal > 0 ? Math.round((item.value / monthTotal) * 100) : 0
                    return (
                      <div key={item.name} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3 w-[45%]">
                          <div
                            className="size-[14px] rounded-[5px] shrink-0 shadow-sm"
                            style={{ background: item.color }}
                          />
                          <span className="text-[14px] text-text-muted font-medium truncate group-hover:text-text transition-colors">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-num text-[14px] font-bold text-text shrink-0 w-[40%] text-right opacity-90">
                          {formatShort(item.value)}đ
                        </span>
                        <span
                          className="font-num text-[14px] font-bold shrink-0 w-[15%] text-right"
                          style={{ color: item.color }}
                        >
                          {pct}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          )}

          {/* Trend — bar */}
          {chartMode === 'trend' && (
            <div className="animate-in fade-in zoom-in-95 duration-300 pt-2 pb-2 px-2 relative">
              <div className="h-[210px]">
                <Suspense fallback={<ChartSkeleton height={210} />}>
                  <ReactApexChart
                    type="bar"
                    options={barOptions}
                    series={barSeries}
                    height="100%"
                    width="100%"
                  />
                </Suspense>
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
