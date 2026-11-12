import { useState } from 'react'
import { motion } from 'framer-motion'
import { useDashboard } from '@/hooks/useDashboard'
import { MonthlyTab } from './MonthlyTab'
import { HistoryTab } from './HistoryTab'
import { getMonthLabel } from '@/lib/utils'
import { triggerHaptic } from '@/lib/haptic'
import { useShouldShowSkeleton } from '@/hooks/useShouldShowSkeleton'
import { OverviewSkeleton } from './OverviewSkeleton'

type Tab = 'month' | 'history'

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('month')
  const data = useDashboard()
  const showSkeleton = useShouldShowSkeleton(data.isLoading)

  // History has its own month navigator, so the header only names the
  // current month on the "Tháng này" tab
  const rightLabel =
    activeTab === 'month'
      ? `${getMonthLabel(data.currentMonthKey)} · ${data.currentMonthKey.slice(0, 4)}`
      : 'Lịch sử chi tiêu'

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

      {/* Sub-tabs — segmented control with sliding pill */}
      <div
        role="tablist"
        className="mx-4 mb-2 flex rounded-full bg-surface p-1 border border-border/60"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              id={`dashboard-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                if (isActive) return
                triggerHaptic('light')
                setActiveTab(tab.id)
              }}
              className="relative h-10 flex-1 rounded-full text-[13px] font-bold"
              style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
            >
              {isActive && (
                <motion.span
                  layoutId="dashboard-tab-pill"
                  className="absolute inset-0 rounded-full bg-accent shadow-sm"
                  transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
                />
              )}
              <span
                className={`relative z-10 transition-colors duration-150 ${
                  isActive ? 'text-white' : 'text-text-muted'
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Scrollable content — data is live (useLiveQuery), so no pull-to-refresh */}
      <div className="flex-1 overflow-y-auto relative bg-bg">
        {activeTab === 'history' ? (
          <HistoryTab />
        ) : data.isLoading ? (
          // Skeleton after a short delay, nothing before — never zeros
          showSkeleton ? <OverviewSkeleton /> : null
        ) : (
          <MonthlyTab data={data} />
        )}
      </div>
    </div>
  )
}
