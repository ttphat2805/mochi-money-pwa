import { motion } from "framer-motion";
import { useHomeData } from "@/hooks/useHomeData";
import { TopBar } from "./TopBar";
import { HeroSection } from "./HeroSection";
import { RecurringSection } from "./RecurringSection";
import { RecentTransactions } from "./RecentTransactions";
import { PullToRefresh } from "@/components/PullToRefresh";
import type { TabKey } from "@/components/BottomNav";
import { useShouldShowSkeleton } from "@/hooks/useShouldShowSkeleton";
import { HomeSkeleton } from "./HomeSkeleton";
import { WaveBackground } from "@/components/ui/WaveBackground";
import * as React from "react";
import { useAppStore } from "@/stores/appStore";

interface HomePageProps {
  onNavigate: (tab: TabKey) => void;
  onSettings: () => void;
}

export function HomePage({ onNavigate, onSettings }: HomePageProps) {
  const home = useHomeData();
  const { openQuickAdd } = useAppStore();
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
      lastMonthSpent={home.lastMonthTotal}
    />
  ), [home.settings, home.todaySpent, home.monthSpent, home.remainingBudget, home.dailyAllowance, home.spentPct, home.daysLeft, home.lastMonthTotal]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface relative">
      <WaveBackground />
      <TopBar onSettingsTap={onSettings} />

      <div className="flex-1 min-h-0 relative z-10">
        <PullToRefresh onRefresh={async () => {}}>
          {showSkeleton ? (
            <HomeSkeleton />
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center px-8 pt-20 pb-8 text-center">
              <div className="text-[64px] mb-4">🍡</div>
              <h2 className="text-[20px] font-bold mb-2 text-text">Chào mừng đến Mochi!</h2>
              <p className="text-text-muted text-[14px] mb-6">Bắt đầu bằng cách ghi chi tiêu đầu tiên của bạn</p>
              <button
                type="button"
                onClick={() => openQuickAdd()}
                className="flex items-center gap-2 h-12 px-6 rounded-2xl bg-accent text-white font-bold text-[15px] shadow-lg shadow-accent/30 active:scale-95 transition-transform"
              >
                <span className="text-[18px]">+</span>
                Ghi chi tiêu đầu tiên
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex flex-col gap-4 pb-8 pt-1"
            >
              {/* Hero: remaining budget + today spend + daily allowance */}
              {renderHero}

              {/* Recurring items for today */}
              {(!home.hasAnyRecurring || home.recurringItems.length > 0) && (
                <RecurringSection
                  items={home.recurringItems}
                  onToggle={home.toggleRecurring}
                  hasAnyRecurring={home.hasAnyRecurring}
                  onSettingsTap={onSettings}
                />
              )}

              {/* Recent transactions — grouped by date */}
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
