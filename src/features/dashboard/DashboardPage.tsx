import { useState } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { MonthlyTab } from './MonthlyTab'
import { HistoryTab } from './HistoryTab'
import { getMonthLabel } from '@/lib/utils'
import { PullToRefresh } from '@/components/PullToRefresh'

type Tab = 'month' | 'history'

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('month')
  const data = useDashboard()

  const rightLabel =
    activeTab === 'month'
      ? `${getMonthLabel(data.currentMonthKey)} · ${data.currentMonthKey.slice(0, 4)}`
      : '12 tháng qua'

  const tabs: { id: Tab; label: string }[] = [
    { id: 'month', label: 'Tháng này' },
    { id: 'history', label: 'Lịch sử' },
  ]

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 safe-top">
        <h1 className="text-[22px] font-semibold tracking-tight">Tổng quan</h1>
        <span className="text-text-muted text-[13px]">{rightLabel}</span>
      </header>

      {/* Sub-tabs */}
      <div className="border-border grid grid-cols-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`dashboard-tab-${tab.id}`}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`h-11 border-b-2 text-[13px] font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-hidden relative bg-bg">
        <PullToRefresh onRefresh={async () => {
          await new Promise(r => setTimeout(r, 800))
        }}>
          {data.isLoading ? (
            <div className="flex h-[200px] items-center justify-center">
              <span className="text-text-muted text-[13px]">Đang tải dữ liệu...</span>
            </div>
          ) : activeTab === 'month' ? (
            <MonthlyTab data={data} />
          ) : (
            <HistoryTab />
          )}
        </PullToRefresh>
      </div>
    </div>
  )
}
