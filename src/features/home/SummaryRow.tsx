import { useEffect, useRef, useState } from "react";
import { formatShort } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface SummaryRowProps {
  todaySpent: number;
  yesterdaySpent?: number;
  monthSpent: number;
  remainingBudget: number | null;
  lastMonthSpent?: number;
}

function AnimatedNumber({
  value,
  formatFn,
}: {
  value: number;
  formatFn: (n: number) => string;
}) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (value === prevValue.current) return;
    const start = prevValue.current;
    const end = value;
    const duration = 400;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    prevValue.current = value;
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <>{formatFn(display)}</>;
}

export function SummaryRow({
  todaySpent,
  yesterdaySpent = 0,
  monthSpent,
  remainingBudget,
  lastMonthSpent = 0,
}: SummaryRowProps) {
  const isUpToday = todaySpent > yesterdaySpent;
  const isUpMonth = monthSpent > lastMonthSpent;

  const stats = [
    {
      label: "HÔM NAY",
      value: todaySpent,
      color: 'var(--color-danger)',
      icon:
        todaySpent > 0 ? (
          isUpToday ? (
            <ArrowUpRight size={10} className="text-danger" />
          ) : (
            <ArrowDownRight size={10} className="text-success" />
          )
        ) : null,
    },
    {
      label: "THÁNG NÀY",
      value: monthSpent,
      color: 'var(--color-accent)',
      icon:
        monthSpent > 0 ? (
          isUpMonth ? (
            <ArrowUpRight size={10} className="text-danger" />
          ) : (
            <ArrowDownRight size={10} className="text-success" />
          )
        ) : null,
    },
    {
      label: "CÒN LẠI",
      value: remainingBudget ?? 0,
      color:
        remainingBudget != null && remainingBudget < 0 ? "#D63E3E" : "#1E8A5E",
      hide: remainingBudget === null,
    },
  ];

  return (
    <div className="px-4 grid grid-cols-3 gap-2.5">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="rounded-2xl p-3 relative overflow-hidden bg-white"
          style={{
            border: "1px solid #E8E6E0",
            boxShadow: `
              0 1px 0 rgba(255,255,255,0.8) inset,
              0 2px 10px rgba(0,0,0,0.03),
              0 4px 12px rgba(0,0,0,0.02)
            `,
          }}
        >
          {/* Subtle Shine */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 60%)",
            }}
          />

          <div className="relative flex flex-col items-center text-center">
            <div className="flex items-center gap-1 mb-1.5">
              <span className="text-[10px] font-bold tracking-widest text-text-hint uppercase">
                {stat.label}
              </span>
              {stat.icon}
            </div>

            <p
              className="font-num font-bold leading-tight"
              style={{ fontSize: 13, color: "#1A1A18" }}
            >
                  <AnimatedNumber
                    value={Math.abs(stat.value)}
                    formatFn={formatShort}
                  />
                  <span
                    className="font-normal ml-0.5"
                    style={{ fontSize: 10, color: "#88887A" }}
                  >
                    đ
                  </span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
