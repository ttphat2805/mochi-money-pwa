import { Home, Wallet, CalendarDays, BarChart2, Plus, type LucideIcon } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/lib/haptic";
import { getTodayString } from "@/lib/utils";

export type TabKey = "home" | "budget" | "calendar" | "overview";

interface BottomNavProps {
  active: TabKey;
  onTab: (tab: TabKey) => void;
}

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavItem({ icon: Icon, label, active, onClick }: NavItemProps) {
  const handleClick = () => {
    triggerHaptic("light");
    onClick();
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileTap={{ scale: 0.9 }}
      className={`relative flex flex-1 h-full flex-col items-center justify-center gap-0.5 transition-colors duration-300 pointer-events-auto z-10 ${
        active ? "text-accent" : "text-text-hint hover:text-text-muted"
      }`}
    >
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-x-2 inset-y-2 rounded-2xl bg-accent/10 -z-10"
        />
      )}
      <div
        className={`transition-transform duration-300 flex items-center justify-center ${active ? "scale-110" : "scale-100"}`}
      >
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      </div>
      <span className="text-[10px] font-bold leading-none">{label}</span>
    </motion.button>
  );
}

export function BottomNav({ active, onTab }: BottomNavProps) {
  const { openQuickAdd, calendarSelectedDay } = useAppStore();

  // When on calendar tab, pre-fill the selected date (or today if none)
  const handleFabClick = () => {
    triggerHaptic("medium");
    if (active === "calendar") {
      openQuickAdd(calendarSelectedDay ?? getTodayString());
    } else {
      openQuickAdd();
    }
  };

  const today = getTodayString();
  const showDateBadge =
    active === "calendar" &&
    calendarSelectedDay !== null &&
    calendarSelectedDay !== today;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-[calc(0.5rem+env(safe-area-inset-bottom))] px-4">
      {/* Container must be pointer-events-auto for clicks */}
      <div
        className="relative mx-auto flex h-[64px] w-full max-w-md items-end pointer-events-auto border-t border-white/5"
      >
        {/* Floating Center FAB */}
        <div className="absolute left-1/2 -top-5 -translate-x-1/2 z-20">
          <motion.button
            type="button"
            onClick={handleFabClick}
            whileTap={{ scale: 0.92 }}
            aria-label="Thêm chi tiêu"
            className="flex size-14 items-center justify-center bg-accent shadow-lg shadow-accent/40 rounded-full text-white"
          >
            <Plus size={28} strokeWidth={3} />
          </motion.button>
          {/* Date badge: shows selected calendar day when it's not today */}
          <AnimatePresence>
            {showDateBadge && (
              <motion.div
                key={calendarSelectedDay}
                initial={{ opacity: 0, y: 4, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="absolute -top-2.5 -right-2 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-tight pointer-events-none whitespace-nowrap"
              >
                {calendarSelectedDay
                  ? calendarSelectedDay.slice(8) + '/' + calendarSelectedDay.slice(5, 7)
                  : ''}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Background Layer with Notch ── */}
        <div className="absolute inset-x-0 bottom-0 h-[64px] flex items-end">
          {/* Left part */}
          <div className="h-full flex-1 bg-card rounded-l-[30px]" />

          {/* Right part */}
          <div className="h-full flex-1 bg-card rounded-r-[30px]" />
        </div>

        {/* ── Icons Overlay ── */}
        <div className="absolute inset-0 z-10 flex h-full items-center px-1">
          {/* Left 2 */}
          <NavItem
            icon={Home}
            label="Trang chủ"
            active={active === "home"}
            onClick={() => onTab("home")}
          />
          <NavItem
            icon={Wallet}
            label="Ngân sách"
            active={active === "budget"}
            onClick={() => onTab("budget")}
          />

          {/* Center Spacer for FAB */}
          <div className="w-[60px] shrink-0 pointer-events-none" />

          {/* Right 2 */}
          <NavItem
            icon={CalendarDays}
            label="Lịch"
            active={active === "calendar"}
            onClick={() => onTab("calendar")}
          />
          <NavItem
            icon={BarChart2}
            label="Tổng quan"
            active={active === "overview"}
            onClick={() => onTab("overview")}
          />
        </div>
      </div>
    </div>
  );
}
