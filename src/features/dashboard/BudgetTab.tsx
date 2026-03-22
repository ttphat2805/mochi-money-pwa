import { useBudget } from "@/hooks/useBudget";
import { formatBudgetPct, formatShort, formatVND } from "@/lib/utils";
import { Settings2 } from "lucide-react";
import { lazy, Suspense } from "react";
import { useAppStore } from "@/stores/appStore";

const ReactApexChart = lazy(() => import("react-apexcharts"));

// ── Small helpers ──────────────────────────────────────────────

function ChartSkeleton() {
  return <div className="h-[200px] bg-surface rounded-2xl animate-pulse" />;
}

function getStatusColor(status: string, fallback: string) {
  if (status === "over") return "var(--color-danger)";
  if (status === "danger") return "var(--color-accent)";
  return fallback;
}

// ── Budget Tab ─────────────────────────────────────────────────

export function BudgetTab() {
  const budget = useBudget();
  const openQuickAdd = useAppStore(s => s.openQuickAdd);

  // ── Radial gauge options ──────────────────────────────────────
  const radialOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "radialBar",
      toolbar: { show: false },
      fontFamily: "inherit",
      animations: { enabled: true, speed: 600 },
      dropShadow: {
        enabled: true,
        blur: 12,
        opacity: 0.08,
        top: 4,
        left: 0,
        color: "#000",
      },
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
          background: "#F0EDE8",
          strokeWidth: "100%",
          margin: 0,
        },
        dataLabels: {
          name: {
            offsetY: -10,
            fontSize: "12px",
            color: "#88887A",
            fontFamily: "inherit",
          },
          value: {
            offsetY: 6,
            fontSize: "22px",
            fontWeight: 700,
            fontFamily: "JetBrains Mono, monospace",
            color: "#1A1A18",
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
          { offset: 0, color: "var(--color-success)", opacity: 1 },
          { offset: 50, color: "var(--color-accent)", opacity: 1 },
          { offset: 100, color: "var(--color-danger)", opacity: 1 },
        ],
      },
    },
    stroke: { lineCap: "round" },
    labels: ["Đã sử dụng"],
  };

  // ── No income configured ──────────────────────────────────────
  if (!budget.isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 text-center animate-in fade-in duration-150">
        <span className="text-5xl mb-4">💰</span>
        <p className="text-[15px] font-semibold text-text mb-2">
          Chưa đặt thu nhập
        </p>
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
      {/* Gauge + Month overview card */}
      <div
        className="mb-4 bg-white rounded-2xl border border-border overflow-hidden shadow-sm"
      >
        {/* Radial gauge */}
        <div className="pt-4 -mb-2 flex justify-center items-center">
          <Suspense fallback={<ChartSkeleton />}>
            <ReactApexChart
              type="radialBar"
              options={radialOptions}
              series={[budget.spentPct]}
              height={200}
              width="100%"
            />
          </Suspense>
        </div>

        {/* Spent / Remaining row */}
        <div className="flex justify-between px-5 pb-2">
          <div>
            <p className="text-[11px] text-text-muted mb-0.5">Đã chi</p>
            <p className="font-num text-[18px] font-bold text-danger leading-tight">
              {formatVND(budget.totalSpent)}đ
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-text-muted mb-0.5">Còn lại</p>
            <p
              className="font-num text-[18px] font-bold leading-tight"
              style={{
                color:
                  budget.flexAmount - budget.totalSpent >= 0
                    ? "var(--color-success)"
                    : "var(--color-danger)",
              }}
            >
              {formatVND(Math.max(0, budget.flexAmount - budget.totalSpent))}đ
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mx-5 h-2.5 bg-surface rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: Math.min(100, budget.spentPct) + "%",
              background:
                budget.spentPct >= 100
                  ? "var(--color-danger)"
                  : budget.spentPct >= 80
                    ? "var(--color-accent)"
                    : "var(--color-success)",
            }}
          />
        </div>

        {/* Days + daily allowance */}
        <div className="flex justify-between items-center px-5 pb-4 text-[11.5px] text-text-muted">
          <span className="font-num">
            {formatBudgetPct(budget.spentPct)} đã dùng
          </span>
          <span>
            Còn {budget.daysLeft} ngày ·{" "}
            <span className="font-num font-semibold text-accent">
              ~{formatShort(budget.dailyAllowance)}/ngày
            </span>
          </span>
        </div>
      </div>

      {/* Category budget list */}
      {catsWithLimit.length > 0 && (
        <>
          <div className="px-1 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[1.2px] text-text-hint">
              Theo danh mục
            </span>
          </div>

          {catsWithLimit.map((cat) => {
            const isFull = cat.pct === 100;
            const isOver = cat.pct > 100;
            const isAtOrOver = cat.pct >= 100;
            
            // Modern 2026 Colors - No more harsh black
            const color = isOver 
              ? "var(--color-danger)" 
              : isFull 
                ? "var(--color-accent)" // Use Accent for Full
                : getStatusColor(cat.status, cat.color ?? "var(--color-success)");

            return (
              <div
                key={cat.id}
                onClick={() => openQuickAdd(undefined, cat.id)}
                className={`mb-4 p-5 bg-white/90 rounded-[32px] shadow-premium border transition-all active-scale cursor-pointer ${
                  isOver ? "border-danger/40 shadow-danger/10" : isFull ? "border-accent/40 shadow-accent" : "border-white/60"
                }`}
              >
                {/* Header info */}
                <div className="flex items-center gap-4 mb-4 bg-muted/30 p-3 rounded-2xl border border-white/60">
                  <div className="size-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm shrink-0">
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-bold text-text truncate leading-tight">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-text-hint mt-1 font-medium">
                      Giới hạn {formatVND(cat.limitPerMonth!)}đ/tháng
                    </p>
                  </div>
                  {/* Modern 2026 Badge Wrapper */}
                  <div 
                    className={`px-4 py-2 rounded-2xl text-[12px] font-black shrink-0 shadow-sm transition-all duration-300 ${
                      isOver 
                        ? "bg-danger text-white ring-4 ring-danger/10" 
                        : isFull 
                          ? "bg-accent text-white ring-4 ring-accent/10" 
                          : "bg-surface2/50 text-text-muted border border-white"
                    }`}
                  >
                    {formatBudgetPct(cat.pct)}
                  </div>
                </div>

                {/* Modern Mesh Progress Bar */}
                <div className="h-3 bg-surface rounded-full overflow-hidden mb-4 relative p-0.5 border border-white/40 shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)"
                    style={{
                      width: Math.min(100, cat.pct) + "%",
                      background: isOver 
                        ? "linear-gradient(90deg, #D63E3E, #FF6B6B)" 
                        : isFull 
                          ? "linear-gradient(90deg, var(--color-accent), var(--color-accent-dark))"
                          : `linear-gradient(90deg, #2A9D6E, ${color})`,
                      boxShadow: isAtOrOver ? `0 0 12px ${color}50` : 'none'
                    }}
                  />
                </div>

                {/* Footer stats */}
                <div className="flex justify-between items-baseline pt-0.5">
                  <span className="text-[12px] text-text-muted font-medium">
                    Đã chi <span className="font-num font-bold text-text">{formatVND(cat.spent)}đ</span>
                  </span>
                  {cat.remaining >= 0 ? (
                    <span className="text-[13px] font-bold text-[#00bcd4]">
                      Còn <span className="font-num">{formatVND(cat.remaining)}đ</span>
                    </span>
                  ) : (
                    <span className="text-[13px] font-bold text-danger">
                      Vượt <span className="font-num">{formatVND(-cat.remaining)}đ</span>
                    </span>
                  )}
                </div>

                {/* Overspending Warning Label */}
                {isOver && (
                  <div className="mt-4 p-2.5 bg-danger/5 rounded-xl border border-danger/10 flex items-center justify-center gap-2 animate-pulse">
                    <span className="text-[11px] font-black text-danger uppercase tracking-tight">
                      ⚠️ Hạn chế chi tiêu lãng phí
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* Categories without limit */}
      {catsWithoutLimit.length > 0 && (
        <div className="mt-2">
          <p className="text-[10px] font-semibold uppercase tracking-[1.2px] text-text-hint mb-2 px-1">
            Chưa đặt giới hạn
          </p>
          <div
            className="bg-white rounded-[22px] relative overflow-hidden shadow-sm"
            style={{
              border: "1px solid rgba(232, 230, 224, 0.6)",
            }}
          >
            {catsWithoutLimit.map((cat, i) => {
              const isSettingThis = budget.settingLimitFor === cat.id;
              return (
                <div
                  key={cat.id}
                  className={`${i > 0 ? "border-t border-border" : ""}`}
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span style={{ fontSize: 22 }}>{cat.icon}</span>
                    <span className="flex-1 text-[13px] text-text font-medium truncate">
                      {cat.name}
                    </span>
                    <div className="text-right flex items-center gap-3">
                      <span className="text-[12px] font-num font-semibold text-text-muted">
                        {formatVND(cat.spent)}đ
                      </span>
                      {!isSettingThis && (
                        <button
                          id={`set-limit-${cat.id}`}
                          type="button"
                          onClick={() => budget.openSetLimit(cat)}
                          className="text-[11px] text-accent font-semibold px-2.5 py-1.5 
                            rounded-lg bg-accent-bg active:opacity-70 transition-opacity whitespace-nowrap"
                        >
                          Đặt giới hạn
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Full-width inline limit setter below */}
                  {isSettingThis && (
                    <div className="px-4 pb-4 animate-in slide-in-from-top-1 duration-200">
                      <div className="flex items-center bg-surface rounded-xl p-1 border border-accent/20">
                        <div className="flex-1 relative">
                          <input
                            id={`limit-input-${cat.id}`}
                            type="text"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            autoFocus
                            placeholder="Nhập số tiền..."
                            value={budget.limitInput}
                            onChange={(e) =>
                              budget.handleLimitInputChange(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                budget.saveLimit(cat.id!, budget.limitAmount);
                              if (e.key === "Escape")
                                budget.setSettingLimitFor(null);
                            }}
                            className="w-full bg-transparent px-3 py-2 text-[14px] font-num font-bold text-accent focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-1 pr-1">
                          <button
                            type="button"
                            onClick={() => budget.setSettingLimitFor(null)}
                            className="px-3 py-1.5 text-[12px] font-medium text-text-hint bg-transparent"
                          >
                            Huỷ
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              budget.saveLimit(cat.id!, budget.limitAmount)
                            }
                            className="px-4 py-2 bg-text text-white text-[12px] font-bold rounded-lg shadow-sm"
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

      {/* Empty state: no categories with limits at all */}
      {catsWithLimit.length === 0 && catsWithoutLimit.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <span className="text-4xl mb-3">📊</span>
          <p className="text-[14px] font-medium text-text-muted">
            Chưa có dữ liệu chi tiêu tháng này
          </p>
        </div>
      )}
    </div>
  );
}
