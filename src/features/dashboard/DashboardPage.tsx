import { useState } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { MonthlyTab } from './MonthlyTab'
import { HistoryTab } from './HistoryTab'
import { getMonthLabel } from '@/lib/utils'

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'month' | 'history'>('month')
  const data = useDashboard()

  const rightLabel =
    activeTab === 'month'
      ? `${getMonthLabel(data.currentMonthKey)} · ${data.currentMonthKey.slice(0, 4)}`
      : '6 tháng qua'

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 safe-top">
        <h1 className="text-[22px] font-semibold tracking-tight">Tổng quan</h1>
        <span className="text-text-muted text-[13px]">{rightLabel}</span>
      </header>

      {/* Sub-tabs */}
      <div className="border-border grid grid-cols-2 border-b">
        <button
          type="button"
          onClick={() => setActiveTab('month')}
          className={`h-11 border-b-2 text-[13px] font-medium transition-colors ${
            activeTab === 'month'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-muted'
          }`}
        >
          Tháng này
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`h-11 border-b-2 text-[13px] font-medium transition-colors ${
            activeTab === 'history'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-muted'
          }`}
        >
          Lịch sử
        </button>
      </div>

      {/* Scrollable content (animate-in handled inside tabs) */}
      <div className="flex-1 overflow-y-auto bg-bg">
        {data.isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <span className="text-text-muted text-[13px]">Đang tải dữ liệu...</span>
          </div>
        ) : activeTab === 'month' ? (
          <MonthlyTab data={data} />
        ) : (
          <HistoryTab data={data} />
        )}
      </div>
    </div>
  )
}
