import { formatVND, cn } from "@/lib/utils";
import type { FinancialSettings } from "@/types";
import { motion, type Variants } from 'framer-motion'
import { Coins, PiggyBank, Wallet, Sparkles } from "lucide-react";

interface StatCardsProps {
  monthTotal: number;
  settings: FinancialSettings | null;
}

export function StatCards({ monthTotal, settings }: StatCardsProps) {
  const income = settings?.income ?? null;
  const saving = settings?.savingTarget ?? null;
  const remaining = income != null ? income - (saving ?? 0) - monthTotal : null;

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
      sub: "Hàng tháng",
      value: income,
      icon: <Coins size={18} className="text-white drop-shadow-md" />,
      gradient: "from-[#34D399] to-[#10B981]", // Light Emerald
      shadow: "shadow-[0_12px_24px_-8px_rgba(16,185,129,0.4)]",
      show: income != null
    },
    {
      label: "Đã chi",
      sub: "Tháng này",
      value: monthTotal,
      icon: <Sparkles size={18} className="text-white drop-shadow-md" />,
      gradient: "from-[#FF8BA7] to-[#FB7185]", // Light Rose
      shadow: "shadow-[0_12px_24px_-8px_rgba(251,113,133,0.4)]",
      show: true
    },
    {
      label: "Tiết kiệm",
      sub: "Mục tiêu",
      value: saving,
      icon: <PiggyBank size={18} className="text-white drop-shadow-md" />,
      gradient: "from-[#93A5CF] to-[#6E8DD6]", // Light Indigo/Blue
      shadow: "shadow-[0_12px_24px_-8px_rgba(110,141,214,0.4)]",
      show: saving != null
    },
    {
      label: "Còn lại",
      sub: "Ngân sách",
      value: remaining,
      icon: <Wallet size={18} className="text-white drop-shadow-md" />,
      gradient: remaining != null && remaining < 0
        ? "from-[#FCA5A5] to-[#EF4444]" // Light Red
        : "from-[#FFC187] to-[#F59E0B]", // Light Amber
      shadow: remaining != null && remaining < 0
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
      {items.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </motion.div>
  );
}

const itemVariant: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } }
}

function StatCard({ stat }: { stat: any }) {
  const { show, value, label, sub, icon, gradient, shadow } = stat;

  return (
    <motion.div 
      variants={itemVariant}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "relative flex flex-col p-4 rounded-[24px] overflow-hidden active:brightness-95 transition-all",
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
          <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest mt-0.5">
              {sub}
          </span>
        </div>
        <div className="size-8 rounded-full bg-white/20 flex items-center justify-center text-white shadow-inner shrink-0 backdrop-blur-md">
           {icon}
        </div>
      </div>

      <div className="mt-auto">
        <p className="font-num font-black text-[17px] tracking-tight text-white flex items-baseline gap-0.5 drop-shadow-sm truncate w-full">
          {show && value != null ? formatVND(Math.abs(value)) : "—"}
          {show && value != null && <span className="text-[12px] font-bold opacity-80 ml-0.5">đ</span>}
        </p>
      </div>
    </motion.div>
  );
}
