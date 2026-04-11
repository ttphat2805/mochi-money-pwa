import * as React from "react";
import { formatShort } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface SummaryRowProps {
  todaySpent: number;
  yesterdaySpent?: number;
  monthSpent: number;
  remainingBudget: number | null;
  lastMonthSpent?: number;
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
    const duration = 300; // Faster transition
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress * (2 - progress); // Simple easeOutQuad
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    prevValue.current = value;
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <>{formatFn(display)}</>;
});

export const SummaryRow = React.memo(({
  todaySpent,
  yesterdaySpent = 0,
  monthSpent,
  remainingBudget,
  lastMonthSpent = 0,
}: SummaryRowProps) => {
  const isUpToday = todaySpent > yesterdaySpent;
  const isUpMonth = monthSpent > lastMonthSpent;

  // Static items to avoid recreation on every render
  const stats = React.useMemo(() => [
    {
      label: "HÔM NAY",
      value: todaySpent,
      icon: todaySpent > 0 ? (
        isUpToday ? <ArrowUpRight size={10} className="text-danger" /> : <ArrowDownRight size={10} className="text-success" />
      ) : null,
    },
    {
      label: "THÁNG NÀY",
      value: monthSpent,
      icon: monthSpent > 0 ? (
        isUpMonth ? <ArrowUpRight size={10} className="text-danger" /> : <ArrowDownRight size={10} className="text-success" />
      ) : null,
    },
    {
      label: "CÒN LẠI",
      value: remainingBudget ?? 0,
      hide: remainingBudget === null,
    },
  ], [todaySpent, isUpToday, monthSpent, isUpMonth, remainingBudget]);

  return (
    <div className="px-4 grid grid-cols-3 gap-2">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl p-3 bg-white border border-border/60 shadow-sm"
        >
          <div className="relative flex flex-col items-center text-center">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[10px] font-bold tracking-widest text-text-hint uppercase">
                {stat.label}
              </span>
              {stat.icon}
            </div>

            <p className="font-num font-bold text-[13px] text-text">
              <AnimatedNumber
                value={Math.abs(stat.value)}
                formatFn={formatShort}
              />
            </p>
          </div>
        </div>
      ))}
    </div>
  );
});
