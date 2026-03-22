import { lazy, Suspense, useMemo } from 'react'
import { formatVND, formatShort } from '@/lib/utils'
import type { DonutSlice } from '@/hooks/useDashboard'

const ReactApexChart = lazy(() => import('react-apexcharts'))

interface DonutChartProps {
  data: DonutSlice[]
  total: number
}

export function DonutChart({ data, total }: DonutChartProps) {
  const options = useMemo((): ApexCharts.ApexOptions => ({
    chart: {
      type: 'donut',
      fontFamily: 'inherit',
      animations: { enabled: true, speed: 500 },
    },
    colors: data.map(d => d.color),
    labels: data.map(d => d.name),
    plotOptions: {
      pie: {
        donut: {
          size: '62%',
          labels: {
            show: true,
            name: { show: true, fontSize: '12px', color: '#88887A', offsetY: -4 },
            value: {
              show: true,
              fontSize: '16px',
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter: (w: any) => {
                const sum = (w.globals.seriesTotals as number[]).reduce((a, b) => a + b, 0)
                return `${formatShort(sum)}đ`
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
      style: { fontSize: '11px', fontWeight: '600', colors: ['#fff'] },
      dropShadow: { enabled: true, blur: 3, opacity: 0.25 },
    },
    stroke: { width: 3, colors: ['#FFFFFF'] },
    legend: { show: false },
    tooltip: {
      y: { formatter: (val: number) => `${formatVND(val)}đ` },
      theme: 'dark',
    },
  }), [data])

  const series = useMemo(() => data.map(d => d.value), [data])

  if (data.length === 0) {
    return (
      <div className="text-text-muted flex h-[200px] items-center justify-center text-[13px]">
        Chưa có chi tiêu tháng này
      </div>
    )
  }

  return (
    <div>
      <Suspense fallback={<div className="h-[200px] bg-surface rounded-2xl animate-pulse" />}>
        <ReactApexChart type="donut" options={options} series={series} height={200} width="100%" />
      </Suspense>

      {/* Legend */}
      <div className="flex flex-col gap-2 px-4 mt-2">
        {data.map((slice) => (
          <div key={slice.name} className="flex items-center gap-2">
            <span className="text-base leading-none shrink-0">{slice.icon}</span>
            <span className="flex-1 text-[13px] truncate">{slice.name}</span>
            <span className="font-num text-text-muted text-[12px] shrink-0">{formatVND(slice.value)}đ</span>
            <span
              className="font-num text-[11px] w-8 text-right shrink-0 font-semibold"
              style={{ color: slice.color }}
            >
              {slice.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
