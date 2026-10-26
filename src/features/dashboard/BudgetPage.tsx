import { Settings } from "lucide-react";
import { getTodayString } from "@/lib/utils";
import { BudgetTab } from "./BudgetTab";

interface BudgetPageProps {
  onSettings: () => void;
}

export function BudgetPage({ onSettings }: BudgetPageProps) {
  const [year, month] = getTodayString().split("-");

  return (
    <div className="flex h-full flex-col app-ambient">
      {/* Header */}
      <header className="safe-top px-5 pt-4 pb-3 flex items-center justify-between">
        <div>
          <p className="text-text-muted text-[11px] font-semibold tracking-wide mb-0.5">
            Tháng {Number(month)}/{year}
          </p>
          <h1 className="text-[26px] font-black text-text tracking-tight leading-tight">
            Ngân sách
          </h1>
        </div>
        <button
          type="button"
          onClick={onSettings}
          className="!min-h-9 flex size-10 items-center justify-center rounded-full glass active:scale-95 transition-transform"
          aria-label="Cài đặt"
        >
          <Settings className="size-[18px] text-text" />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <BudgetTab />
      </div>
    </div>
  );
}
