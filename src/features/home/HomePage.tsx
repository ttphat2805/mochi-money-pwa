import { useHomeData } from "@/hooks/useHomeData";
import { TopBar } from "./TopBar";
import { HeroSection } from "./HeroSection";
import { RecurringSection } from "./RecurringSection";
import { SummaryRow } from "./SummaryRow";
import { BudgetWarnings } from "./BudgetWarnings";
import { RecentTransactions } from "./RecentTransactions";
import { PullToRefresh } from "@/components/PullToRefresh";
import type { TabKey } from "@/components/BottomNav";
import { useShouldShowSkeleton } from "@/hooks/useShouldShowSkeleton";
import { HomeSkeleton } from "./HomeSkeleton";


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
          {showSkeleton ? (
            <HomeSkeleton />
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center px-8 pt-20 pb-8 text-center animate-slide-up">
              <div className="text-[72px] mb-6 drop-shadow-xl">🍡</div>
              <h2 className="text-[22px] font-bold mb-3 text-text">Chào mừng đến Mochi!</h2>
              <p className="text-text-muted text-[15px] w-[260px] mb-20 leading-relaxed">
                Bắt đầu bằng cách thêm chi tiêu đầu tiên của bạn
              </p>
              <div className="animate-bounce mt-8">
                <div className="w-14 h-14 bg-accent/20 border-2 border-accent/30 rounded-full flex items-center justify-center text-accent text-3xl shadow-accent">
                  ↓
                </div>
              </div>
            </div>
          ) : (
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
                yesterdaySpent={home.yesterdaySpent}
                monthSpent={home.monthSpent}
                remainingBudget={home.remainingBudget}
                lastMonthSpent={home.lastMonthTotal}
              />
            </div>

            {/* Budget warnings */}
            {home.categoryWarnings.length > 0 && (
              <div className="animate-slide-up delay-2 content-visibility-auto">
                <BudgetWarnings warnings={home.categoryWarnings} />
              </div>
            )}

            {/* Recurring items for today */}
            {(!home.hasAnyRecurring || home.recurringItems.length > 0) && (
              <div className="animate-slide-up delay-3 content-visibility-auto">
                <RecurringSection
                  items={home.recurringItems}
                  onToggle={home.toggleRecurring}
                  hasAnyRecurring={home.hasAnyRecurring}
                  onSettingsTap={onSettings}
                />
              </div>
            )}

            {/* Last 5 transactions */}
            <div className="animate-slide-up delay-4 content-visibility-auto">
              <RecentTransactions
                transactions={home.recentTransactions}
                onViewAll={() => onNavigate("calendar")}
              />
            </div>
          </div>
          )}
        </PullToRefresh>
      </div>
    </div>
  );
}
