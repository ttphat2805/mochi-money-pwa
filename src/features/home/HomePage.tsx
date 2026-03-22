import { useHomeData } from "@/hooks/useHomeData";
import { TopBar } from "./TopBar";
import { HeroSection } from "./HeroSection";
import { RecurringSection } from "./RecurringSection";
import { SummaryRow } from "./SummaryRow";
import { BudgetWarnings } from "./BudgetWarnings";
import { RecentTransactions } from "./RecentTransactions";
import { PullToRefresh } from "@/components/PullToRefresh";
import type { TabKey } from "@/components/BottomNav";

interface HomePageProps {
  onNavigate: (tab: TabKey) => void;
  onSettings: () => void;
}

export function HomePage({ onNavigate, onSettings }: HomePageProps) {
  const home = useHomeData();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Fixed top bar */}
      <div className="animate-slide-up">
        <TopBar onSettingsTap={onSettings} />
      </div>

      {/* Scrollable content container */}
      <div className="flex-1 min-h-0 relative">
        <PullToRefresh
          onRefresh={async () => {
            await new Promise((r) => setTimeout(r, 800));
          }}
        >
          <div className="flex flex-col gap-4 pb-4 pt-1">
            {/* Hero — budget or greeting */}
            <div className="animate-slide-up delay-1">
              <HeroSection
                settings={home.settings}
                todaySpent={home.todaySpent}
                monthSpent={home.monthSpent}
                remainingBudget={home.remainingBudget}
                dailyAllowance={home.dailyAllowance}
                spentPct={home.spentPct}
                daysLeft={home.daysLeft}
              />
            </div>

            {/* 3-stat summary */}
            <div className="animate-slide-up delay-2">
              <SummaryRow
                todaySpent={home.todaySpent}
                monthSpent={home.monthSpent}
                remainingBudget={home.remainingBudget}
                lastMonthSpent={home.lastMonthTotal}
              />
            </div>

            {/* Budget warnings */}
            {home.categoryWarnings.length > 0 && (
              <div className="animate-slide-up delay-2">
                <BudgetWarnings warnings={home.categoryWarnings} />
              </div>
            )}

            {/* Recurring items for today */}
            <div className="animate-slide-up delay-3">
              <RecurringSection
                items={home.recurringItems}
                onToggle={home.toggleRecurring}
                onGoToSettings={onSettings}
              />
            </div>

            {/* Last 5 transactions */}
            <div className="animate-slide-up delay-4">
              <RecentTransactions
                transactions={home.recentTransactions}
                onViewAll={() => onNavigate("calendar")}
              />
            </div>
          </div>
        </PullToRefresh>
      </div>
    </div>
  );
}
