import { useBudget } from "@/hooks/useBudget";
import { formatBudgetPct, formatShort, formatVND, cn } from "@/lib/utils";
import { Settings2, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { lazy, Suspense } from "react";
import { useAppStore } from "@/stores/appStore";
import { useShouldShowSkeleton } from "@/hooks/useShouldShowSkeleton";
import { BudgetSkeleton } from "./BudgetSkeleton";
import { motion } from "framer-motion";

const ReactApexChart = lazy(() => import("react-apexcharts"));

// ── Small helpers ──────────────────────────────────────────────

function ChartSkeleton() {
  return <div className="h-[200px] bg-surface rounded-2xl animate-pulse" />;
}

// ── Budget Tab ─────────────────────────────────────────────────

export function BudgetTab() {
  const budget = useBudget();
  const openQuickAdd = useAppStore(s => s.openQuickAdd);
  const showSkeleton = useShouldShowSkeleton(budget.isLoading);

  if (showSkeleton) return <BudgetSkeleton />;

  // ── Radial gauge options ──────────────────────────────────────
  const radialOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "radialBar",
      toolbar: { show: false },
      fontFamily: "inherit",
      animations: { enabled: true, speed: 600 },
    },
    plotOptions: {
      radialBar: {
        startAngle: -130,
        endAngle: 130,
        hollow: {
          size: "66%",
          background: "transparent",
        },
        track: {
          background: "#F1F5F9",
          strokeWidth: "100%",
          margin: 0,
        },
        dataLabels: {
          name: {
            offsetY: -10,
            fontSize: "12px",
            color: "#64748B",
            fontFamily: "inherit",
          },
          value: {
            offsetY: 6,
            fontSize: "24px",
            fontWeight: 800,
            fontFamily: "inherit",
            color: "#0F172A",
            formatter: (val) => val + "%",
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        colorStops: [
          { offset: 0, color: "#10B981", opacity: 1 },
          { offset: 50, color: "#F59E0B", opacity: 1 },
          { offset: 100, color: "#EF4444", opacity: 1 },
        ],
      },
    },
    stroke: { lineCap: "round" },
    labels: ["Đã sử dụng"],
  };

  if (!budget.isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 text-center animate-in fade-in duration-150">
        <span className="text-5xl mb-4">💰</span>
        <p className="text-[15px] font-semibold text-text mb-2">Chưa đặt thu nhập</p>
        <p className="text-[13px] text-text-muted">
          Vào Cài đặt → Tài chính để thiết lập thu nhập và ngân sách hàng tháng
        </p>
        <div className="mt-4 flex items-center gap-1.5 text-[12px] text-text-hint">
          <Settings2 size={13} />
          Cài đặt → Tài chính
        </div>
      </div>
    );
  }

  const catsWithLimit = budget.categoriesWithBudget
    .filter((c) => c.limitPerMonth)
    .sort((a, b) => b.pct - a.pct);

  const catsWithoutLimit = budget.categoriesWithBudget.filter(
    (c) => !c.limitPerMonth && c.spent > 0,
  );

  return (
    <div className="flex-1 overflow-y-auto bg-bg px-4 py-4 scrollbar-hide pb-32 pt-2 animate-in fade-in duration-150 mesh-gradient min-h-full">
      {/* Gauge overview card */}
      <div className="mb-6 bg-white rounded-[32px] border border-white shadow-premium overflow-hidden">
        <div className="pt-6 -mb-4 flex justify-center items-center">
          <Suspense fallback={<ChartSkeleton />}>
            <ReactApexChart
              type="radialBar"
              options={radialOptions}
              series={[budget.spentPct]}
              height={220}
              width="100%"
            />
          </Suspense>
        </div>

        <div className="flex justify-between px-6 pb-2">
          <div>
            <p className="text-[11px] font-bold text-text-hint uppercase tracking-wider mb-1">Đã chi</p>
            <p className="font-num text-[20px] font-black text-danger leading-tight">
              {formatVND(budget.totalSpent)}đ
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold text-text-hint uppercase tracking-wider mb-1">Còn lại</p>
            <p className={cn("font-num text-[20px] font-black leading-tight", 
                budget.flexAmount - budget.totalSpent >= 0 ? "text-success" : "text-danger"
            )}>
              {formatVND(Math.max(0, budget.flexAmount - budget.totalSpent))}đ
            </p>
          </div>
        </div>

        <div className="mx-6 h-2 bg-surface rounded-full overflow-hidden mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: Math.min(100, budget.spentPct) + "%" }}
            transition={{ duration: 1 }}
            className="h-full rounded-full bg-text"
          />
        </div>

        <div className="flex justify-between items-center px-6 pb-6 text-[12px] text-text-muted font-medium">
          <span className="font-num">{formatBudgetPct(budget.spentPct)} đã dùng</span>
          <span>
            Còn {budget.daysLeft} ngày · <span className="text-text font-bold">~{formatShort(budget.dailyAllowance)}/ngày</span>
          </span>
        </div>
      </div>

      {/* Category budget list */}
      {catsWithLimit.length > 0 && (
        <div className="space-y-4">
          <div className="px-1 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-text-hint">
              Theo danh mục
            </span>
          </div>

          {catsWithLimit.map((cat) => {
            const isFull = cat.pct === 100;
            const isOver = cat.pct > 100;
            const diff = cat.spent - cat.lastMonthSpent;
            const isIncrease = diff > 0;
            const diffAbs = Math.abs(diff);
            
            
            return (
              <div
                key={cat.id}
                onClick={() => openQuickAdd(undefined, cat.id)}
                className={cn(
                  "p-5 bg-white rounded-[32px] shadow-premium border transition-all active-scale cursor-pointer",
                  isOver ? "border-danger/20" : isFull ? "border-accent/20" : "border-white"
                )}
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="size-12 rounded-2xl bg-surface flex items-center justify-center text-2xl shadow-sm shrink-0 border border-border/40">
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-[15px] font-bold text-text truncate">
                        {cat.name}
                      </h3>
                      {cat.lastMonthSpent > 0 && diffAbs > 0 && (
                        <div className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5",
                          isIncrease ? "bg-danger-bg text-danger" : "bg-success-bg text-success"
                        )}>
                          {isIncrease ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {isIncrease ? 'Tăng' : 'Giảm'} {formatShort(diffAbs)}
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-text-hint font-medium">
                      Giới hạn {formatVND(cat.limitPerMonth!)}đ
                    </p>
                  </div>
                  <div className={cn("text-[13px] font-black", isOver ? "text-danger" : isFull ? "text-accent" : "text-text-muted")}>
                    {formatBudgetPct(cat.pct)}
                  </div>
                </div>

                <div className="h-2.5 bg-surface rounded-full overflow-hidden mb-5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: Math.min(100, cat.pct) + "%" }}
                    transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
                    className="h-full"
                    style={{ background: isOver ? "#EF4444" : isFull ? "#F59E0B" : "#10B981" }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-hint uppercase tracking-widest font-bold mb-0.5">Đã chi</span>
                    <span className="text-[14px] font-bold text-text font-num">{formatShort(cat.spent)}đ</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-text-hint uppercase tracking-widest font-bold mb-0.5">
                      {cat.remaining >= 0 ? "Còn lại" : "Vượt mức"}
                    </span>
                    <span className={cn("text-[14px] font-bold font-num", cat.remaining >= 0 ? "text-success" : "text-danger")}>
                      {formatShort(Math.abs(cat.remaining))}đ
                    </span>
                  </div>
                </div>

                {isOver && (
                  <div className="mt-5 p-3 bg-danger/5 rounded-2xl border border-danger/10 flex items-center gap-3">
                    <AlertCircle size={14} className="text-danger shrink-0" />
                    <span className="text-[10px] font-bold text-danger uppercase leading-tight">
                      Bạn đã chi tiêu vượt quá kế hoạch đề ra
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Categories without limit */}
      {catsWithoutLimit.length > 0 && (
        <div className="mt-8">
          <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-text-hint mb-3 px-1">
            Chưa đặt giới hạn
          </p>
          <div className="bg-white rounded-[32px] overflow-hidden border border-white shadow-premium">
            {catsWithoutLimit.map((cat, i) => {
              const isSettingThis = budget.settingLimitFor === cat.id;
              return (
                <div key={cat.id} className={cn(i > 0 && "border-t border-border/50")}>
                  <div className="flex items-center gap-4 px-5 py-4">
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="flex-1 text-[14px] text-text font-bold truncate">
                      {cat.name}
                    </span>
                    <div className="text-right flex items-center gap-4">
                      <span className="text-[13px] font-num font-bold text-text-muted">
                        {formatShort(cat.spent)}đ
                      </span>
                      {!isSettingThis && (
                        <button
                          type="button"
                          onClick={() => budget.openSetLimit(cat)}
                          className="text-[11px] text-white font-bold px-3 py-2 rounded-xl bg-text active:scale-95 transition-all"
                        >
                          Đặt giới hạn
                        </button>
                      )}
                    </div>
                  </div>

                  {isSettingThis && (
                    <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center bg-surface rounded-2xl p-1.5 border border-border">
                        <input
                          type="text"
                          pattern="[0-9]*"
                          inputMode="numeric"
                          autoFocus
                          placeholder="Nhập số tiền..."
                          value={budget.limitInput}
                          onChange={(e) => budget.handleLimitInputChange(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") budget.saveLimit(cat.id!, budget.limitAmount);
                            if (e.key === "Escape") budget.setSettingLimitFor(null);
                          }}
                          className="flex-1 bg-transparent px-3 py-2 text-[14px] font-bold text-text focus:outline-none"
                        />
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => budget.setSettingLimitFor(null)}
                            className="px-3 py-2 text-[12px] font-bold text-text-hint"
                          >
                            Huỷ
                          </button>
                          <button
                            type="button"
                            onClick={() => budget.saveLimit(cat.id!, budget.limitAmount)}
                            className="px-5 py-2 bg-text text-white text-[12px] font-bold rounded-xl shadow-sm"
                          >
                            Lưu
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {catsWithLimit.length === 0 && catsWithoutLimit.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-4xl mb-4">📊</span>
          <p className="text-[14px] font-bold text-text-muted">Chưa có dữ liệu chi tiêu</p>
        </div>
      )}
    </div>
  );
}
