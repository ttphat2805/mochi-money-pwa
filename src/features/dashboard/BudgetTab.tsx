import { useBudget } from "@/hooks/useBudget";
import { formatBudgetPct, formatShort, formatVND } from "@/lib/utils";
import { Settings2 } from "lucide-react";
import { lazy, Suspense } from "react";

const ReactApexChart = lazy(() => import("react-apexcharts"));

// ── Small helpers ──────────────────────────────────────────────

function ChartSkeleton() {
  return <div className="h-[200px] bg-surface rounded-2xl animate-pulse" />;
}

function getStatusColor(status: string, fallback: string) {
  if (status === "over") return "#D63E3E";
  if (status === "danger") return "#E8A020";
  return fallback;
}

// ── Budget Tab ─────────────────────────────────────────────────

export function BudgetTab() {
  const budget = useBudget();

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
          { offset: 0, color: "#2A9D6E", opacity: 1 },
          { offset: 50, color: "#E8A020", opacity: 1 },
          { offset: 100, color: "#D63E3E", opacity: 1 },
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
    <div className="flex flex-col pb-32 pt-2 animate-in fade-in duration-150">
      {/* Gauge + Month overview card */}
      <div
        className="mx-4 mb-4 bg-white rounded-2xl border border-border overflow-hidden"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
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
                    ? "#2A9D6E"
                    : "#D63E3E",
              }}
            >
              {formatVND(Math.max(0, budget.flexAmount - budget.totalSpent))}đ
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mx-5 h-2.5 bg-bg rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: Math.min(100, budget.spentPct) + "%",
              background:
                budget.spentPct >= 100
                  ? "#D63E3E"
                  : budget.spentPct >= 80
                    ? "#E8A020"
                    : "#2A9D6E",
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
              ~{formatShort(budget.dailyAllowance)}đ/ngày
            </span>
          </span>
        </div>
      </div>

      {/* Category budget list */}
      {catsWithLimit.length > 0 && (
        <>
          <div className="px-4 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[1.2px] text-text-hint">
              Theo danh mục
            </span>
          </div>

          {catsWithLimit.map((cat) => {
            const color = getStatusColor(cat.status, cat.color ?? "#2A9D6E");

            return (
              <div
                key={cat.id}
                className="mx-4 mb-3 p-4 bg-white rounded-2xl border border-border"
                style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
              >
                {/* Header */}
                <div className="flex bg-accent-bg rounded-xl p-3 items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl shrink-0"
                    style={{ background: color + "15" }}
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold text-text truncate">
                      {cat.name}
                    </p>
                    <p className="text-[11px] text-text-muted font-num">
                      Giới hạn {formatVND(cat.limitPerMonth!)}đ/tháng
                    </p>
                  </div>
                  {/* Status badge */}
                  <div
                    className="px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0"
                    style={{ background: color + "18", color }}
                  >
                    {formatBudgetPct(cat.pct)}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 bg-bg rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: Math.min(100, cat.pct) + "%",
                      background: `linear-gradient(90deg, ${color}BB, ${color})`,
                    }}
                  />
                </div>

                {/* Stats row */}
                <div className="flex justify-between text-[11.5px]">
                  <span className="text-text-muted font-num">
                    Đã chi {formatVND(cat.spent)}đ
                  </span>
                  {cat.remaining >= 0 ? (
                    <span className="font-num font-semibold" style={{ color }}>
                      Còn {formatVND(cat.remaining)}đ
                    </span>
                  ) : (
                    <span className="font-num font-semibold text-danger">
                      Vượt {formatVND(-cat.remaining)}đ
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Categories without limit */}
      {catsWithoutLimit.length > 0 && (
        <div className="mx-4 mt-2">
          <p className="text-[10px] font-semibold uppercase tracking-[1.2px] text-text-hint mb-2">
            Chưa đặt giới hạn
          </p>
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            {catsWithoutLimit.map((cat, i) => {
              const isSettingThis = budget.settingLimitFor === cat.id;
              return (
                <div
                  key={cat.id}
                  className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <span style={{ fontSize: 22 }}>{cat.icon}</span>
                  <span className="flex-1 text-[13px] text-text">
                    {cat.name}
                  </span>
                  <span className="text-[12px] font-num font-semibold text-text-muted">
                    {formatVND(cat.spent)}đ
                  </span>

                  {/* Inline limit setter */}
                  {isSettingThis ? (
                    <div className="flex bg-bg rounded-xl p-1 mt-3">
                      <input
                        id={`limit-input-${cat.id}`}
                        type="text"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        autoFocus
                        placeholder="VD: 5.000.000"
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
                        className="flex-1 bg-transparent px-2 py-1.5 text-[13px] font-num font-semibold focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          budget.saveLimit(cat.id!, budget.limitAmount)
                        }
                        className="px-4 py-1.5 bg-accent text-white text-[12px] font-semibold rounded-lg shrink-0"
                      >
                        Lưu
                      </button>
                      <button
                        type="button"
                        onClick={() => budget.setSettingLimitFor(null)}
                        className="text-[11px] text-text-muted px-1 py-1.5"
                      >
                        Huỷ
                      </button>
                    </div>
                  ) : (
                    <button
                      id={`set-limit-${cat.id}`}
                      type="button"
                      onClick={() => budget.openSetLimit(cat)}
                      className="text-[11px] text-accent font-semibold px-2.5 py-1.5
                        rounded-lg bg-accent-bg active:opacity-70 transition-opacity shrink-0"
                    >
                      Đặt giới hạn
                    </button>
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
