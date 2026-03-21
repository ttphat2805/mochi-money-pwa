import {
  LineChart, Line, XAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { formatVND } from '@/lib/utils'
import type { DailyDatum } from '@/hooks/useDashboard'

interface DailyLineChartProps {
  data: DailyDatum[]
  dailyBudget?: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length || payload[0].value === 0) return null
  return (
    <div style={{ background: '#1A1A18', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: '#fff' }}>
      <p>Ngày {label}: {formatVND(payload[0].value as number)}đ</p>
    </div>
  )
}

const axisTick = { fontSize: 10, fill: '#88887A' }

export function DailyLineChart({ data, dailyBudget }: DailyLineChartProps) {
  const hasData = data.some((d) => d.amount > 0)

  if (!hasData) {
    return (
      <div className="text-text-muted flex h-[140px] items-center justify-center text-[13px]">
        Chưa có giao dịch tháng này
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="day"
          tick={axisTick}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => (v === 1 || v % 5 === 0) ? String(v) : ''}
        />
        <Tooltip content={<CustomTooltip />} />
        {dailyBudget && (
          <ReferenceLine
            y={dailyBudget}
            stroke="#B8B8A8"
            strokeDasharray="4 2"
            label={{ value: 'Mức/ngày', position: 'insideTopRight', fontSize: 9, fill: '#88887A' }}
          />
        )}
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#E8A020"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, fill: '#E8A020', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
