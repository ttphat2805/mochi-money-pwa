import { formatVND, cn } from "@/lib/utils";
import { getRemainingBudget } from "@/lib/budget";
import type { FinancialSettings } from "@/types";
import { motion, type Variants } from 'framer-motion'
import { Coins, PiggyBank, Wallet, Sparkles } from "lucide-react";

interface StatCardsProps {
  monthTotal: number;
  settings: FinancialSettings | null;
  /** This month's extra incomes */
  extraIncome: number;
  /** Monthly budget from lib/budget.ts (income + extra − saving) */
  monthlyBudget: number;
}

// Gradient stops are dark enough for white text (≥4.5:1 on the lighter stop)
export function StatCards({ monthTotal, settings, extraIncome, monthlyBudget }: StatCardsProps) {
  const baseIncome = settings?.income || null;
  const income = baseIncome != null ? baseIncome + extraIncome : null;
  const saving = settings?.savingTarget ?? null;
  const remaining = baseIncome != null ? getRemainingBudget(monthlyBudget, monthTotal) : null;
  const isOver = remaining != null && remaining < 0;

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const items = [
    {
      label: "Thu nhập",
      sub: extraIncome > 0 ? "Gồm thu nhập phụ" : "Hàng tháng",
      value: income,
      icon: <Coins size={18} className="text-white drop-shadow-md" />,
      gradient: "from-[#047857] to-[#065F46]", // Emerald 700 → 800
      shadow: "shadow-[0_12px_24px_-8px_rgba(16,185,129,0.4)]",
      show: income != null
    },
    {
      label: "Đã chi",
      sub: "Tháng này",
      value: monthTotal,
      icon: <Sparkles size={18} className="text-white drop-shadow-md" />,
      gradient: "from-[#E11D48] to-[#BE123C]", // Rose 600 → 700
      shadow: "shadow-[0_12px_24px_-8px_rgba(251,113,133,0.4)]",
      show: true
    },
    {
      label: "Tiết kiệm",
      sub: "Mục tiêu",
      value: saving,
      icon: <PiggyBank size={18} className="text-white drop-shadow-md" />,
      gradient: "from-[#4F46E5] to-[#4338CA]", // Indigo 600 → 700
      shadow: "shadow-[0_12px_24px_-8px_rgba(110,141,214,0.4)]",
      show: saving != null
    },
    {
      label: isOver ? "Vượt ngân sách" : "Còn lại",
      sub: "Ngân sách",
      value: remaining,
      icon: <Wallet size={18} className="text-white drop-shadow-md" />,
      gradient: isOver
        ? "from-danger to-[#991B1B]" // Red 600 → 800
        : "from-[#B45309] to-[#92400E]", // Amber 700 → 800
      shadow: isOver
        ? "shadow-[0_12px_24px_-8px_rgba(239,68,68,0.4)]"
        : "shadow-[0_12px_24px_-8px_rgba(245,158,11,0.4)]",
      show: remaining != null
    }
  ];

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3"
    >
      {items.map((stat, i) => (
        <StatCard key={i} stat={stat} />
      ))}
    </motion.div>
  );
}

const itemVariant: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } }
}

interface StatItem {
  label: string;
  sub: string;
  value: number | null;
  icon: React.ReactNode;
  gradient: string;
  shadow: string;
  show: boolean;
}

function StatCard({ stat }: { stat: StatItem }) {
  const { show, value, label, sub, icon, gradient, shadow } = stat;

  return (
    <motion.div
      variants={itemVariant}
      className={cn(
        "relative flex flex-col p-4 rounded-[24px] overflow-hidden",
        gradient,
        "bg-gradient-to-br",
        shadow
      )}
    >
      {/* Glass Overlay Shine */}
      <div className="absolute top-0 left-0 w-full h-[60%] bg-white/10 blur-[14px] -translate-y-1/2 rounded-full pointer-events-none" />

      {/* Header (Label on left, Icon on right) */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col">
          <span className="text-[14px] font-bold text-white tracking-tight leading-tight drop-shadow-sm">
              {label}
          </span>
          <span className="text-[10px] font-bold text-white/85 uppercase tracking-widest mt-0.5">
              {sub}
          </span>
        </div>
        <div className="size-8 rounded-full bg-white/20 flex items-center justify-center text-white shadow-inner shrink-0 backdrop-blur-md">
           {icon}
        </div>
      </div>

      <div className="mt-auto">
        <p className="font-num font-black text-[17px] tracking-tight text-white flex items-baseline gap-0.5 drop-shadow-sm truncate w-full">
          {show && value != null ? `${value < 0 ? "-" : ""}${formatVND(Math.abs(value))}` : "—"}
          {show && value != null && <span className="text-[12px] font-bold opacity-80 ml-0.5">đ</span>}
        </p>
      </div>
    </motion.div>
  );
}
