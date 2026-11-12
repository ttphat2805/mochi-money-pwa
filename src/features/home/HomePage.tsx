import { motion } from "framer-motion";
import { useHomeData } from "@/hooks/useHomeData";
import { TopBar } from "./TopBar";
import { HeroSection } from "./HeroSection";
import { RecurringSection } from "./RecurringSection";
import { RecentTransactions } from "./RecentTransactions";
import { BudgetWarnings } from "./BudgetWarnings";
import type { TabKey } from "@/components/BottomNav";
import { useShouldShowSkeleton } from "@/hooks/useShouldShowSkeleton";
import { HomeSkeleton } from "./HomeSkeleton";
import { PiggyBank } from "lucide-react";
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
    <div className="flex h-full flex-col overflow-hidden app-ambient relative">
      <TopBar onSettingsTap={onSettings} />

      {/* Scroll container (previously provided by PullToRefresh, removed:
          data is live via useLiveQuery so a refresh gesture was a no-op) */}
      <div className="flex-1 min-h-0 relative z-10 overflow-y-auto">
        {home.isLoading ? (
          // Skeleton after a short delay; blank before it to avoid a flash
          // on fast loads. Never the first-run screen while loading.
          showSkeleton ? <HomeSkeleton /> : null
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center px-8 pt-20 pb-8 text-center">
            <div className="mb-5 size-20 rounded-[28px] glass flex items-center justify-center">
              <PiggyBank size={40} className="text-accent-dark" strokeWidth={1.5} />
            </div>
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
            className="flex flex-col gap-6 pb-10 pt-1"
          >
            {/* Hero: remaining budget + today spend + daily allowance */}
            {renderHero}

            {/* Per-category budget alerts (≥80% of limit) */}
            <BudgetWarnings warnings={home.categoryWarnings} />

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
      </div>
    </div>
  );
}
