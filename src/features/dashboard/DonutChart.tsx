import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatVND } from '@/lib/utils'
import type { DonutSlice } from '@/hooks/useDashboard'

interface DonutChartProps {
  data: DonutSlice[]
  total: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as DonutSlice
  return (
    <div style={{ background: '#1A1A18', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: '#fff' }}>
      <p>{d.icon} {d.name}</p>
      <p>{formatVND(d.value)}đ · {d.pct}%</p>
    </div>
  )
}

export function DonutChart({ data, total }: DonutChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-text-muted flex h-[200px] items-center justify-center text-[13px]">
        Chưa có chi tiêu tháng này
      </div>
    )
  }

  return (
    <div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((slice, i) => (
                <Cell key={i} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-text-muted text-[10px] uppercase tracking-wide">Đã chi</span>
          <span className="font-num text-[15px] font-bold">{formatVND(total)}đ</span>
        </div>
      </div>

      {/* Legend below chart */}
      <div className="flex flex-col gap-2 px-4">
        {data.map((slice) => (
          <div key={slice.name} className="flex items-center gap-2">
            <span className="text-base leading-none">{slice.icon}</span>
            <span className="flex-1 text-[13px]">{slice.name}</span>
            <span className="font-num text-text-muted text-[12px]">{formatVND(slice.value)}đ</span>
            <span className="font-num text-text-hint w-9 text-right text-[11px]">{slice.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
