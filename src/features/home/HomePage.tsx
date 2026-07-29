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
import { Sparkles } from "lucide-react";
import * as React from "react";
import { useAppStore } from "@/stores/appStore";
import { ChibiCharacter } from "@/components/ui/ChibiCharacter";

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
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="flex flex-col items-center justify-center px-8 pt-16 pb-8 text-center"
            >
              {/* Chibi Character */}
              <motion.div className="mb-6">
                <ChibiCharacter mood="happy" size="lg" />
              </motion.div>

              {/* Decorative sparkles */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute right-8 top-32 opacity-30"
              >
                <Sparkles size={32} className="text-accent" />
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute left-8 top-48 opacity-20"
              >
                <Sparkles size={24} className="text-accent" />
              </motion.div>

              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-[22px] font-bold mb-2 text-text"
              >
                Chào mừng đến Mochi Money! 🎉
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-text-muted text-[14px] mb-8"
              >
                Hãy ghi chi tiêu đầu tiên để bắt đầu theo dõi tài chính của bạn
              </motion.p>
              <motion.button
                type="button"
                onClick={() => openQuickAdd()}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                className="flex items-center gap-2 h-12 px-6 rounded-full bg-accent text-white font-bold text-[15px] shadow-lg shadow-accent/40 hover:shadow-accent/50 transition-shadow"
              >
                <motion.span 
                  className="text-[20px]"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                >
                  ✨
                </motion.span>
                Ghi chi tiêu đầu tiên
              </motion.button>
            </motion.div>
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
