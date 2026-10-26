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
      className={`relative flex flex-1 h-full flex-col items-center justify-center gap-1 transition-colors duration-300 pointer-events-auto z-10 ${
        active ? "text-text" : "text-text-hint"
      }`}
    >
      {/* Sliding active pill — shared layoutId animates between tabs */}
      {active && (
        <motion.div
          layoutId="bottom-nav-active"
          transition={{ type: "spring", stiffness: 500, damping: 38 }}
          className="absolute inset-x-1.5 inset-y-1.5 rounded-[20px] -z-10"
          style={{
            background: "rgba(var(--color-accent-rgb), 0.16)",
            boxShadow: "inset 0 0 0 1px rgba(var(--color-accent-rgb), 0.28)",
          }}
        />
      )}
      <Icon
        size={20}
        strokeWidth={active ? 2.5 : 2}
        style={active ? { color: "var(--color-accent-dark)" } : undefined}
      />
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
      {/* Floating glass pill */}
      <div className="relative mx-auto flex h-[64px] w-full max-w-md items-center pointer-events-auto rounded-[26px] glass-strong px-1">
        {/* Raised center FAB */}
        <div className="absolute left-1/2 -top-6 -translate-x-1/2 z-20">
          <motion.button
            type="button"
            onClick={handleFabClick}
            whileTap={{ scale: 0.9 }}
            aria-label="Thêm chi tiêu"
            className="flex size-[58px] items-center justify-center rounded-[22px] text-white border border-white/25"
            style={{
              background:
                "linear-gradient(145deg, rgba(var(--color-accent-rgb), 1) 0%, rgba(var(--color-accent-rgb), 0.75) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.35), 0 12px 28px -6px rgba(var(--color-accent-rgb), 0.65), 0 0 0 6px var(--color-bg)",
            }}
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
                className="absolute -top-2.5 -right-3 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-tight pointer-events-none whitespace-nowrap border border-white/20"
              >
                {calendarSelectedDay
                  ? calendarSelectedDay.slice(8) + '/' + calendarSelectedDay.slice(5, 7)
                  : ''}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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

        {/* Center spacer for FAB */}
        <div className="w-[64px] shrink-0 pointer-events-none" />

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
  );
}
