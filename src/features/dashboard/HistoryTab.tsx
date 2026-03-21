import { BarChart6Months } from './BarChart6Months'
import { TopCategories } from './TopCategories'
import type { useDashboard } from '@/hooks/useDashboard'

interface HistoryTabProps {
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

export function HistoryTab({ data }: HistoryTabProps) {
  return (
    <div className="flex flex-col gap-2 pb-6 pt-2 animate-in fade-in duration-150">
      {/* 6-month Bar Chart */}
      <div>
        <SectionTitle>TỔNG CHI 6 THÁNG</SectionTitle>
        <div className="mx-4 mt-1 rounded-[14px] border border-border bg-white py-4">
          <BarChart6Months data={data.barData} />
        </div>
      </div>

      {/* Top 5 Categories */}
      <div className="mt-2">
        <SectionTitle>TOP DANH MỤC (Tháng này)</SectionTitle>
        <div className="mx-4 mt-1 rounded-[14px] border border-border bg-white py-4">
          <TopCategories items={data.topCategories} />
        </div>
      </div>
    </div>
  )
}
