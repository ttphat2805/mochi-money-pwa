import { BarChart, Bar, XAxis, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatVND } from '@/lib/utils'
import { getCurrentMonthString } from '@/lib/utils'
import type { BarMonthDatum } from '@/hooks/useDashboard'

interface BarChart6MonthsProps {
  data: BarMonthDatum[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1A1A18', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: '#fff' }}>
      <p>{label}: {formatVND(payload[0].value as number)}đ</p>
    </div>
  )
}

const axisTick = { fontSize: 10, fill: '#88887A' }

export function BarChart6Months({ data }: BarChart6MonthsProps) {
  const currentMonthKey = getCurrentMonthString()

  if (data.every((d) => d.total === 0)) {
    return (
      <div className="text-text-muted flex h-[180px] items-center justify-center text-[13px]">
        Chưa có dữ liệu lịch sử
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }} barCategoryGap="30%">
        <XAxis dataKey="monthLabel" tick={axisTick} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(232,160,32,0.08)' }} />
        <Bar dataKey="total" radius={[5, 5, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.monthKey === currentMonthKey ? '#E8A020' : '#FDDFA0'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
