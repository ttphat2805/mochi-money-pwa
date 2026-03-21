import { StatCards } from './StatCards'
import { DonutChart } from './DonutChart'
import { DailyLineChart } from './DailyLineChart'
import type { useDashboard } from '@/hooks/useDashboard'

interface MonthlyTabProps {
  data: ReturnType<typeof useDashboard>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pb-1 pt-6">
      <span className="text-text-hint text-[10px] font-medium uppercase tracking-[1.2px]">
        {children}
      </span>
    </div>
  )
}

export function MonthlyTab({ data }: MonthlyTabProps) {
  return (
    <div className="flex flex-col gap-2 pb-6 pt-2 animate-in fade-in duration-150">
      {/* 2x2 grid */}
      <StatCards monthTotal={data.monthTotal} settings={data.settings} />

      {/* Donut chart */}
      <div className="mt-2">
        <SectionTitle>Danh mục chi tiêu</SectionTitle>
        <div className="mx-4 mt-1 rounded-[14px] border border-border bg-white py-4">
          <DonutChart data={data.donutData} total={data.monthTotal} />
        </div>
      </div>

      {/* Line chart */}
      <div className="mt-2">
        <SectionTitle>Chi tiêu hằng ngày</SectionTitle>
        <div className="mx-4 mt-1 rounded-[14px] border border-border bg-white p-4">
          <DailyLineChart data={data.dailyData} dailyBudget={data.dailyBudget} />
        </div>
      </div>
    </div>
  )
}
