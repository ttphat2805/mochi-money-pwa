import { motion } from "framer-motion";
import { useHomeData } from "@/hooks/useHomeData";
import { TopBar } from "./TopBar";
import { HeroSection } from "./HeroSection";
import { RecurringSection } from "./RecurringSection";
import { SummaryRow } from "./SummaryRow";
import { RecentTransactions } from "./RecentTransactions";
import { TrendBadge } from "./TrendBadge";
import { PullToRefresh } from "@/components/PullToRefresh";
import type { TabKey } from "@/components/BottomNav";
import { useShouldShowSkeleton } from "@/hooks/useShouldShowSkeleton";
import { HomeSkeleton } from "./HomeSkeleton";
import * as React from "react";

interface HomePageProps {
  onNavigate: (tab: TabKey) => void;
  onSettings: () => void;
}

export function HomePage({ onNavigate, onSettings }: HomePageProps) {
  const home = useHomeData();
  const showSkeleton = useShouldShowSkeleton(home.isLoading);

  const isEmpty =
    !home.isLoading &&
    home.recentTransactions.length === 0 &&
    !home.settings?.income &&
    home.recurringItems.length === 0;

  const renderHero = React.useMemo(() => (
    <HeroSection
      settings={home.settings}
      todaySpent={home.todaySpent}
      monthSpent={home.monthSpent}
      remainingBudget={home.remainingBudget}
      dailyAllowance={home.dailyAllowance}
      spentPct={home.spentPct}
      daysLeft={home.daysLeft}
    />
  ), [home.settings, home.todaySpent, home.monthSpent, home.remainingBudget, home.dailyAllowance, home.spentPct, home.daysLeft]);

  const renderStats = React.useMemo(() => (
    <div className="flex flex-col gap-3">
      <TrendBadge
        monthSpent={home.monthSpent}
        lastMonthSpent={home.lastMonthTotal}
        onClick={() => onNavigate("overview")}
      />
      <SummaryRow
        todaySpent={home.todaySpent}
        yesterdaySpent={home.yesterdaySpent}
        monthSpent={home.monthSpent}
        remainingBudget={home.remainingBudget}
        lastMonthSpent={home.lastMonthTotal}
      />
    </div>
  ), [home.monthSpent, home.lastMonthTotal, home.todaySpent, home.yesterdaySpent, home.remainingBudget, onNavigate]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface">
      <TopBar onSettingsTap={onSettings} />

      <div className="flex-1 min-h-0 relative">
        <PullToRefresh onRefresh={async () => {}}>
          {showSkeleton ? (
            <HomeSkeleton />
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center px-8 pt-20 pb-8 text-center">
              <div className="text-[64px] mb-4">🍡</div>
              <h2 className="text-[20px] font-bold mb-2 text-text">Chào mừng đến Mochi!</h2>
              <p className="text-text-muted text-[14px]">Bắt đầu bằng cách thêm chi tiêu đầu tiên</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex flex-col gap-3 pb-8 pt-1"
            >
              {renderHero}
              {renderStats}
  
              {(!home.hasAnyRecurring || home.recurringItems.length > 0) && (
                <RecurringSection
                  items={home.recurringItems}
                  onToggle={home.toggleRecurring}
                  hasAnyRecurring={home.hasAnyRecurring}
                  onSettingsTap={onSettings}
                />
              )}
  
              <RecentTransactions
                transactions={home.recentTransactions}
                onViewAll={() => onNavigate("calendar")}
              />
            </motion.div>
          )}
        </PullToRefresh>
      </div>
    </div>
  );
}
