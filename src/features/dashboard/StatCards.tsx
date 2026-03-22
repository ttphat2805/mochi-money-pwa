import { formatVND } from "@/lib/utils";
import type { FinancialSettings } from "@/types";

interface StatCardsProps {
  monthTotal: number;
  settings: FinancialSettings | null;
}

export function StatCards({ monthTotal, settings }: StatCardsProps) {
  const income = settings?.income ?? null;
  const saving = settings?.savingTarget ?? null;
  const remaining = income != null ? income - (saving ?? 0) - monthTotal : null;

  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard label="Thu nhập" value={income} color="text-success" />
      <StatCard label="Đã chi" value={monthTotal} color="text-danger" always />
      <StatCard label="Tiết kiệm" value={saving} color="text-accent" />
      <StatCard
        label="Còn lại"
        value={remaining}
        color={remaining != null && remaining < 0 ? "text-danger" : "text-accent"}
      />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | null;
  color: string;
  always?: boolean;
}

function StatCard({ label, value, color, always }: StatCardProps) {
  const show = always || value != null;

  return (
    <div className="rounded-[24px] bg-white/90 p-4 shadow-premium border border-white active-scale">
      <p className="text-text-hint text-[10px] font-black uppercase tracking-[1.5px] opacity-70">
        {label}
      </p>
      <p
        className={`font-num mt-2 text-[20px] font-black leading-tight tracking-tight ${show ? color : "text-text-hint"}`}
      >
        {show && value != null ? `${formatVND(value)}đ` : "—"}
      </p>
    </div>
  );
}
