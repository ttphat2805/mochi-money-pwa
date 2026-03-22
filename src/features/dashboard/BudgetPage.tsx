import { Settings } from "lucide-react";
import { BudgetTab } from "./BudgetTab";

interface BudgetPageProps {
  onSettings: () => void;
}

export function BudgetPage({ onSettings }: BudgetPageProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="safe-top px-5 pt-3 pb-2 flex items-center justify-between">
        <h1 className="text-[22px] font-semibold tracking-tight">Ngân sách</h1>
        <button
          type="button"
          onClick={onSettings}
          className="flex size-9 items-center justify-center rounded-full bg-white border border-border shadow-sm active:scale-95 transition-transform"
          aria-label="Cài đặt"
        >
          <Settings className="size-4 text-text-muted" />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <BudgetTab />
      </div>
    </div>
  );
}
