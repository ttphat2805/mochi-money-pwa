import { lazy, Suspense, useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, BarChart2, PieChart, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { formatVND, formatShort } from '@/lib/utils'
import { StatCards } from './StatCards'
import type { useDashboard } from '@/hooks/useDashboard'

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
  const [chartMode, setChartMode] = useState<'distribution' | 'trend'>('distribution')

  const { monthTotal, settings, donutData, last4MonthsBar, lastMonthTotal } = data

  const diff = monthTotal - lastMonthTotal
  const isIncrease = diff > 0

  // ── Bar chart options ──────────────────────────────────────────

  const barData = last4MonthsBar || []

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
        enabled: true,
        enabledOnSeries: [0],
        top: 8,
        left: 0,
        blur: 16,
        color: '#E8A020',
        opacity: 0.35,
      },
    },

    plotOptions: {
      bar: {
        borderRadius: 12,
        borderRadiusApplication: 'end',
        columnWidth: '48%',
        dataLabels: { position: 'top' },
        distributed: true,
      },
    },

    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.5,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.8,
        stops: [0, 90, 100],
      },
    },

    colors: barData.map(d =>
      d.isCurrentMonth ? '#E8A020' : '#D0CCC6'
    ),

    dataLabels: {
      enabled: true,
      formatter: (val: number) => val > 0 ? formatShort(val) : '',
      offsetY: -32,
      style: {
        fontSize: '11px',
        fontWeight: 700,
        fontFamily: 'JetBrains Mono, monospace',
        colors: barData.map(d =>
          d.isCurrentMonth ? '#B87B10' : '#A8A49E'
        ),
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
          colors: barData.map(d =>
            d.isCurrentMonth ? '#E8A020' : '#A8A49E'
          ),
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
            <div style="font-size: 14px; font-weight: 700; color: ${isCurrent ? '#E8A020' : '#fff'};">
              ${formatVND(val)}đ
            </div>
          </div>
        `
      },
    },

    states: {
      hover: { filter: { type: 'darken', value: 0.88 } as any },
      active: { filter: { type: 'darken', value: 0.82 } as any },
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
        enabled: true,
        top: 0,
        left: 0,
        blur: 16,
        color: '#000',
        opacity: 0.1,
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
            name: {
              show: true,
              fontSize: '12px',
              color: '#88887A',
              offsetY: -4,
              fontFamily: 'inherit',
            },
            value: {
              show: true,
              fontSize: '18px',
              fontWeight: '700',
              color: '#1A1A18',
              fontFamily: 'JetBrains Mono, monospace',
              offsetY: 4,
              formatter: (val: string) => `${formatShort(parseInt(val))}đ`,
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Tổng chi',
              fontSize: '11px',
              color: '#88887A',
              fontFamily: 'inherit',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter: (w: any) => {
                const total = (w.globals.seriesTotals as number[]).reduce((a, b) => a + b, 0)
                return `${formatShort(total)}đ`
              },
            },
          },
        },
        expandOnClick: false,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val > 5 ? `${Math.round(val)}%` : '',
      style: {
        fontSize: '11px',
        fontWeight: '600',
        fontFamily: 'inherit',
        colors: ['#fff'],
      },
      dropShadow: { enabled: true, blur: 3, opacity: 0.25 },
    },
    stroke: { width: 3, colors: ['#FFFFFF'] },
    legend: { show: false },
    tooltip: {
      y: { formatter: (val: number) => `${formatVND(val)}đ` },
      theme: 'dark',
    },
    states: {
      hover: { filter: { type: 'darken', value: 0.85 } as any },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: { type: 'darken', value: 0.8 } as any,
      },
    },
  }), [donutData])

  const donutSeries = useMemo(() => donutData.map(d => d.value), [donutData])

  return (
    <div className="flex flex-col pb-32 pt-2 animate-in fade-in duration-150">
      {/* Stat cards */}
      <div className="px-4 pt-2">
        <StatCards monthTotal={monthTotal} settings={settings} />
      </div>

      {/* Income / Expense strip */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl border-2 bg-white" style={{ borderColor: '#E8A020' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <ArrowUpCircle size={13} className="text-danger shrink-0" />
              <span className="text-[11px] text-text-hint">Chi tiêu</span>
            </div>
            <p className="font-num text-[17px] font-bold text-text leading-none mt-1">
              {formatVND(monthTotal)}đ
            </p>
          </div>
          <div className="p-3 rounded-xl border border-border bg-white">
            <div className="flex items-center gap-1.5 mb-1">
              <ArrowDownCircle size={13} className="text-success shrink-0" />
              <span className="text-[11px] text-text-hint">Thu nhập</span>
            </div>
            <p className="font-num text-[17px] font-bold text-text leading-none mt-1">
              {settings?.income ? `${formatVND(settings.income)}đ` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Chart section */}
      <div className="mt-4 mx-4 rounded-[16px] border border-border bg-white overflow-hidden">
        {/* Toggle header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <span className="text-[11px] font-medium text-text-hint uppercase tracking-[1px]">
            {chartMode === 'distribution' ? 'Phân bổ chi tiêu' : 'Xu hướng tháng'}
          </span>
          <button
            type="button"
            onClick={() => setChartMode(m => m === 'distribution' ? 'trend' : 'distribution')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border rounded-full text-[12px] font-medium text-text transition-transform active:scale-95"
          >
            {chartMode === 'distribution'
              ? <><BarChart2 size={12} /> Xu hướng</>
              : <><PieChart size={12} /> Phân bổ</>
            }
          </button>
        </div>

        {/* Chart with fade */}
        <div key={chartMode} style={{ animation: 'fadeIn 200ms ease-out' }}>

          {/* Distribution — donut */}
          {chartMode === 'distribution' && (
            donutData.length === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-[13px] text-text-muted">
                Chưa có chi tiêu tháng này
              </div>
            ) : (
              <div className="pb-4">
                <Suspense fallback={<ChartSkeleton height={280} />}>
                  <ReactApexChart
                    type="donut"
                    options={donutOptions}
                    series={donutSeries}
                    height={280}
                    width="100%"
                  />
                </Suspense>

                {/* Custom legend */}
                <div className="flex flex-col gap-2.5 px-4 mt-1">
                  {donutData.map((item) => {
                    const pct = monthTotal > 0 ? Math.round((item.value / monthTotal) * 100) : 0
                    return (
                      <div key={item.name} className="flex items-center gap-2.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: item.color }}
                        />
                        <span className="text-[13px] flex-1 truncate text-text">
                          {item.icon} {item.name}
                        </span>
                        <div className="w-16 h-1.5 bg-surface2 rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: item.color }}
                          />
                        </div>
                        <span
                          className="font-num text-[11px] font-semibold w-7 text-right shrink-0"
                          style={{ color: item.color }}
                        >
                          {pct}%
                        </span>
                        <span className="font-num text-[11px] text-text-hint w-14 text-right shrink-0">
                          {formatShort(item.value)}đ
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
          <div
            className="relative mx-4 mb-4"
            style={{
              background: 'white',
              borderRadius: 20,
              padding: '16px 8px 12px',
              boxShadow: `
                0 2px 8px rgba(0,0,0,0.04),
                0 8px 24px rgba(232,160,32,0.08),
                0 1px 0 rgba(255,255,255,0.8) inset
              `,
              border: '1px solid rgba(232,160,32,0.1)',
            }}
          >
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider px-2 mb-1">
              Chi tiêu theo tháng
            </p>

            <Suspense fallback={<ChartSkeleton height={220} />}>
              <ReactApexChart
                type="bar"
                options={barOptions}
                series={barSeries}
                height={220}
                width="100%"
              />
            </Suspense>

            {diff !== 0 && lastMonthTotal > 0 && (
              <div
                className="mx-2 mt-1 flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                  background: isIncrease ? '#FFF0F0' : '#EDFAF4',
                }}
              >
                {isIncrease ? (
                  <TrendingUp size={13} className="text-danger" />
                ) : (
                  <TrendingDown size={13} className="text-success" />
                )}
                <span className="text-xs text-text-muted">
                  {isIncrease ? 'Tăng ' : 'Giảm '}
                  <span
                    className="font-semibold font-mono"
                    style={{ color: isIncrease ? '#D63E3E' : '#2A9D6E' }}
                  >
                    {formatVND(Math.abs(diff))}đ
                  </span>{' '}
                  so với tháng trước
                </span>
              </div>
            )}
          </div>
          )}
        </div>
      </div>

    </div>
  )
}
