import * as React from "react";
import { cn, formatShort } from "@/lib/utils";
import { CalendarDays, Wallet, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface SummaryRowProps {
  todaySpent: number;
  monthSpent: number;
  remainingBudget: number | null;
}

// Optimized AnimatedNumber using React.memo and simple increments for tiny numbers
const AnimatedNumber = React.memo(({
  value,
  formatFn,
}: {
  value: number;
  formatFn: (n: number) => string;
}) => {
  const [display, setDisplay] = React.useState(value);
  const prevValue = React.useRef(value);
  const rafRef = React.useRef<number>(0);

  React.useEffect(() => {
    if (value === prevValue.current) return;
    const start = prevValue.current;
    const end = value;
    const duration = 400; 
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress * (2 - progress); 
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    prevValue.current = value;
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <>{formatFn(display)}</>;
});

/**
 * Senior UX Architecture: Glassy Summary Cards
 * Implements the Asymmetric Rounded Radii and Vibrant Gradients from the reference UI.
 */
export const SummaryRow = React.memo(({
  todaySpent,
  monthSpent,
  remainingBudget,
}: SummaryRowProps) => {

  const stats = React.useMemo(() => [
    {
      label: "Hôm nay",
      value: todaySpent,
      sub: "Chi tiêu",
      icon: <Sparkles size={16} />,
      color: "#FF6B8B", // Pink
      gradient: "from-[#FF8BA7] to-[#FF6B8B]",
      shadow: "shadow-[0_10px_20px_-5px_rgba(255,107,139,0.3)]"
    },
    {
      label: "Tháng này",
      value: monthSpent,
      sub: "Tổng chi",
      icon: <CalendarDays size={16} />,
      color: "#6A89FF", // Blue/Purple
      gradient: "from-[#8AA2FF] to-[#6A89FF]",
      shadow: "shadow-[0_10px_20px_-5px_rgba(106,137,255,0.3)]"
    },
    {
      label: "Còn lại",
      value: remainingBudget ?? 0,
      sub: "Ngân sách",
      icon: <Wallet size={16} />,
      color: "#FFB067", // Orange
      gradient: "from-[#FFC187] to-[#FFB067]",
      shadow: "shadow-[0_10px_20px_-5px_rgba(255,176,103,0.3)]"
    },
  ], [todaySpent, monthSpent, remainingBudget]);

  return (
    <div className="px-4 grid grid-cols-3 gap-3">
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          whileTap={{ scale: 0.96 }}
          className={cn(
            "relative flex flex-col p-3 rounded-[24px] overflow-hidden",
            stat.gradient,
            "bg-gradient-to-br",
            stat.shadow
          )}
        >
          {/* Glass Overlay Shine */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 blur-xl -translate-y-1/2 rounded-full" />

          {/* Icon in specific circular tint */}
          <div className="size-8 rounded-full bg-white/20 flex items-center justify-center text-white mb-3 shadow-inner">
             {stat.icon}
          </div>

          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-white tracking-tight leading-tight">
                {stat.label}
            </span>
            <span className="text-[9px] font-medium text-white/70 uppercase tracking-widest mb-1 mt-0.5">
                {stat.sub}
            </span>

            <p className="font-mono font-black text-[15px] text-white flex items-baseline gap-0.5">
              <AnimatedNumber
                value={Math.abs(stat.value)}
                formatFn={formatShort}
              />
              <span className="text-[10px] opacity-70">đ</span>
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
});