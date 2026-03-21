import { useEffect } from 'react'
import { useQuickAdd } from '@/hooks/useQuickAdd'
import { useHomeData } from '@/hooks/useHomeData'
import { useQuickAddStore } from '@/stores/quickAddStore'
import { QuickAddSheet } from '@/features/quick-add/QuickAddSheet'
import { TopBar } from './TopBar'
import { HeroSection } from './HeroSection'
import { RecurringSection } from './RecurringSection'
import { SummaryRow } from './SummaryRow'
import { RecentTransactions } from './RecentTransactions'
import type { TabKey } from '@/components/BottomNav'

interface HomePageProps {
  onNavigate: (tab: TabKey) => void
  onSettings: () => void
}

export function HomePage({ onNavigate, onSettings }: HomePageProps) {
  const quickAdd = useQuickAdd()
  const home = useHomeData()
  const storeOpen = useQuickAddStore((s) => s.isOpen)
  const storeClose = useQuickAddStore((s) => s.close)

  // Sync: when BottomNav FAB sets store open, open the QuickAdd sheet
  useEffect(() => {
    if (storeOpen && !quickAdd.isOpen) {
      quickAdd.open()
    }
    if (!storeOpen && quickAdd.isOpen) {
      // sheet was closed internally — reset store too
    }
  }, [storeOpen])

  // When sheet closes internally, sync back to store
  useEffect(() => {
    if (!quickAdd.isOpen) {
      storeClose()
    }
  }, [quickAdd.isOpen, storeClose])

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Fixed top bar */}
      <TopBar onSettingsTap={onSettings} />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 pb-6">
          {/* Hero — budget or greeting */}
          <HeroSection
            settings={home.settings}
            todaySpent={home.todaySpent}
            monthSpent={home.monthSpent}
            remainingBudget={home.remainingBudget}
            dailyAllowance={home.dailyAllowance}
            spentPct={home.spentPct}
          />

          {/* 3-stat summary */}
          <SummaryRow
            todaySpent={home.todaySpent}
            monthSpent={home.monthSpent}
            remainingBudget={home.remainingBudget}
          />

          {/* Recurring items for today */}
          <RecurringSection
            items={home.recurringItems}
            onToggle={home.toggleRecurring}
            onGoToSettings={onSettings}
          />

          {/* Last 5 transactions */}
          <RecentTransactions
            transactions={home.recentTransactions}
            onViewAll={() => onNavigate('calendar')}
          />
        </div>
      </div>

      {/* Quick Add sheet — FAB lives in BottomNav, state synced via store */}
      <QuickAddSheet quickAdd={quickAdd} />
    </div>
  )
}
