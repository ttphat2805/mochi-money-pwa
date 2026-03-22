import { lazy, Suspense, useMemo } from 'react'
import { formatVND, formatShort, getCurrentMonthString } from '@/lib/utils'
import type { BarMonthDatum } from '@/hooks/useDashboard'

const ReactApexChart = lazy(() => import('react-apexcharts'))

interface BarChart6MonthsProps {
  data: BarMonthDatum[]
}

export function BarChart6Months({ data }: BarChart6MonthsProps) {
  const currentMonthKey = getCurrentMonthString()

  const options = useMemo((): ApexCharts.ApexOptions => ({
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'inherit',
      animations: {
        enabled: true,
        speed: 400,
        animateGradually: { enabled: true, delay: 80 },
      },
      dropShadow: {
        enabled: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        borderRadiusApplication: 'end',
        columnWidth: '55%',
        dataLabels: { position: 'top' },
      },
    },
    colors: data.map(d => d.monthKey === currentMonthKey ? '#E8A020' : '#E0DDD8'),
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.2,
        gradientToColors: data.map(d => d.monthKey === currentMonthKey ? '#F5C043' : '#D0CEC8'),
        opacityFrom: 1,
        opacityTo: 0.8,
        stops: [0, 100],
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val > 0 ? formatShort(val) : '',
      offsetY: -20,
      style: {
        fontSize: '10px',
        fontWeight: '500',
        fontFamily: 'inherit',
        colors: data.map(d => d.monthKey === currentMonthKey ? '#B87B10' : '#A0A09A'),
      },
      background: { enabled: false },
      dropShadow: { enabled: false },
    },
    xaxis: {
      categories: data.map(d => d.monthLabel),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          fontSize: '10px',
          fontFamily: 'inherit',
          colors: data.map(d => d.monthKey === currentMonthKey ? '#E8A020' : '#88887A'),
        },
      },
    },
    yaxis: { show: false },
    grid: {
      show: true,
      borderColor: '#EDE9E3',
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
      padding: { top: 16, right: 8, bottom: 0, left: 8 },
    },
    tooltip: {
      y: { formatter: (val: number) => `${formatVND(val)}đ` },
      style: { fontSize: '12px', fontFamily: 'inherit' },
      theme: 'dark',
    },
    states: {
      hover: { filter: { type: 'darken', value: 0.85 } as any },
    },
  }), [data, currentMonthKey])

  const series = useMemo(() => [{
    name: 'Chi tiêu',
    data: data.map(d => d.total),
  }], [data])

  if (data.every((d) => d.total === 0)) {
    return (
      <div className="text-text-muted flex h-[180px] items-center justify-center text-[13px]">
        Chưa có dữ liệu lịch sử
      </div>
    )
  }

  return (
    <Suspense fallback={<div className="h-[180px] bg-surface rounded-2xl animate-pulse" />}>
      <ReactApexChart
        type="bar"
        options={options}
        series={series}
        height={180}
        width="100%"
      />
    </Suspense>
  )
}
