import { Home, Wallet, CalendarDays, BarChart2, Plus } from "lucide-react";
import { useAppStore } from "@/stores/appStore";

export type TabKey = "home" | "budget" | "calendar" | "overview";

interface BottomNavProps {
  active: TabKey;
  onTab: (tab: TabKey) => void;
}

interface NavItemProps {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavItem({ icon: Icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-1 h-full flex-col items-center justify-center gap-0.5 transition-all duration-300 pointer-events-auto ${
        active ? "text-accent" : "text-text-hint hover:text-[#A0A09A]"
      }`}
    >
      <div
        className={`transition-transform duration-300 flex items-center justify-center ${active ? "scale-110" : "scale-100"}`}
      >
        <Icon size={22} strokeWidth={active ? 2.5 : 2} />
      </div>
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </button>
  );
}

export function BottomNav({ active, onTab }: BottomNavProps) {
  const { openQuickAdd } = useAppStore();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-[calc(0.5rem+env(safe-area-inset-bottom))] px-4">
      {/* Container must be pointer-events-auto for clicks */}
      <div
        className="relative mx-auto flex h-[64px] w-full max-w-md items-end pointer-events-auto"
        style={{ filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.08))" }}
      >
        {/* Floating Center FAB */}
        <div className="absolute left-1/2 -top-5 -translate-x-1/2 z-20">
          <button
            type="button"
            onClick={() => openQuickAdd()}
            aria-label="Thêm chi tiêu"
            className="flex size-14 items-center justify-center bg-accent shadow-lg shadow-amber-100 rounded-full transition-transform duration-300 active:scale-95 text-white"
          >
            <Plus size={28} strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Background Layer with Notch ── */}
        <div className="absolute inset-x-0 bottom-0 h-[64px] flex items-end">
          {/* Left part */}
          <div className="h-full flex-1 bg-white rounded-l-[30px]" />

          {/* Center Notch: Mathematically aligned bowl */}
          <div className="relative h-[64px] w-[110px] shrink-0 -mx-px">
            <svg
              viewBox="0 0 110 64"
              fill="none"
              className="h-full w-full pointer-events-none"
            >
              <path
                d="M 0 0 C 24 0, 24 46, 55 46 C 86 46, 86 0, 110 0 L 110 64 L 0 64 Z"
                fill="white"
              />
            </svg>
          </div>

          {/* Right part */}
          <div className="h-full flex-1 bg-white rounded-r-[30px]" />
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
          <div className="w-[110px] shrink-0 pointer-events-none" />

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
