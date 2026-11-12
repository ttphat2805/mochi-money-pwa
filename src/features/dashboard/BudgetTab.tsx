import { useState } from "react";
import { useBudget, type CategoryBudgetItem } from "@/hooks/useBudget";
import { triggerHaptic } from "@/lib/haptic";
import { formatBudgetPct, formatShort, formatVND, cn, tint } from "@/lib/utils";
import { Settings2, TrendingUp, TrendingDown, AlertCircle, PiggyBank, BarChart3, ChevronDown, Pencil } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { useAppStore } from "@/stores/appStore";
import { useShouldShowSkeleton } from "@/hooks/useShouldShowSkeleton";
import { BUDGET_STATUS_COLORS, getBudgetStatus } from "@/types";
import { BudgetSkeleton } from "./BudgetSkeleton";
import { motion } from "framer-motion";

// ── Gauge geometry — 250° arc with the gap centered at the bottom ─────────
// Screen coords (y down): t=0 → lower-left, t=0.5 → top, t=1 → lower-right.

const G_CX = 120;
const G_CY = 110;
const G_R = 92;
const G_STROKE = 18;
const G_START = 145; // degrees
const G_SWEEP = 250; // degrees

function gaugePolar(t: number) {
  const rad = ((G_START + t * G_SWEEP) * Math.PI) / 180;
  return { x: G_CX + G_R * Math.cos(rad), y: G_CY + G_R * Math.sin(rad) };
}

/**
 * Arc between two fractions of the gauge, split into ≤62.5° segments so the
 * SVG large-arc flag never becomes ambiguous (renderers disagree near 180°).
 */
function gaugeArc(t0: number, t1: number) {
  const steps = Math.max(1, Math.ceil((t1 - t0) / 0.25));
  const pts = Array.from({ length: steps + 1 }, (_, i) =>
    gaugePolar(t0 + ((t1 - t0) * i) / steps),
  );
  return pts
    .slice(1)
    .reduce((d, p) => `${d} A ${G_R} ${G_R} 0 0 1 ${p.x} ${p.y}`, `M ${pts[0].x} ${pts[0].y}`);
}

const GAUGE_TRACK = gaugeArc(0, 1);

// ── Small pill action with a ≥44px invisible hit area ─────────────

const pillActionClass = cn(
  "relative min-h-0 text-[11px] font-bold px-3 py-1.5 rounded-full active:scale-95 transition-all",
  'after:absolute after:-inset-x-1 after:-inset-y-2 after:content-[""]',
);

const pillActionStyle = {
  color: "var(--color-accent-dark)",
  background: "rgba(var(--color-accent-rgb), 0.16)",
  boxShadow: "inset 0 0 0 1px rgba(var(--color-accent-rgb), 0.3)",
};

// ── Inline limit editor (shared by limited + unlimited categories) ──

function LimitEditor({
  budget,
  cat,
}: {
  budget: ReturnType<typeof useBudget>;
  cat: CategoryBudgetItem;
}) {
  const close = () => {
    triggerHaptic("light");
    budget.setSettingLimitFor(null);
  };
  const save = () => {
    triggerHaptic("light");
    void budget.saveLimit(cat.id!, budget.limitAmount);
  };

  return (
    <div className="animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center bg-white/5 rounded-[18px] p-1.5 border border-white/10">
        <input
          type="text"
          pattern="[0-9]*"
          inputMode="numeric"
          enterKeyHint="done"
          autoFocus
          aria-label={`Giới hạn hằng tháng cho ${cat.name}`}
          placeholder="Nhập số tiền..."
          value={budget.limitInput}
          onChange={(e) => budget.handleLimitInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") budget.setSettingLimitFor(null);
          }}
          className="flex-1 min-w-0 bg-transparent px-3 py-2 text-[14px] font-bold text-text focus:outline-none"
        />
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={close}
            aria-label="Huỷ đặt giới hạn"
            className="px-2 py-2 text-[12px] font-bold text-text-hint active:scale-95 transition-transform"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={save}
            aria-label={`Lưu giới hạn cho ${cat.name}`}
            className="px-4 py-2 bg-accent text-white text-[12px] font-bold rounded-[14px] shadow-accent whitespace-nowrap active:scale-95 transition-transform"
          >
            Lưu
          </button>
        </div>
      </div>
      {cat.limitPerMonth != null && (
        <button
          type="button"
          onClick={() => {
            triggerHaptic("light");
            void budget.removeLimit(cat.id!);
          }}
          className="mt-1 px-2 text-[12px] font-bold text-danger active:scale-95 transition-transform"
        >
          Bỏ giới hạn
        </button>
      )}
    </div>
  );
}

// ── Budget Tab ─────────────────────────────────────────────────

export function BudgetTab() {
  const budget = useBudget();
  const openQuickAdd = useAppStore(s => s.openQuickAdd);
  const showSkeleton = useShouldShowSkeleton(budget.isLoading);
  const [showIdleCats, setShowIdleCats] = useState(false);

  // While loading, render the skeleton (after its short delay) or nothing —
  // never the "not configured" / empty copy built from default values
  if (budget.isLoading) return showSkeleton ? <BudgetSkeleton /> : null;

  if (!budget.isConfigured) {
    return (
      <div className="mx-4 mt-2 glass rounded-[24px] flex flex-col items-center justify-center py-16 px-8 text-center animate-in fade-in duration-150">
        <PiggyBank size={44} className="text-text-hint mb-4" />
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

  const catsWithoutLimit = budget.categoriesWithBudget.filter((c) => !c.limitPerMonth);
  const spendingNoLimit = catsWithoutLimit.filter((c) => c.spent > 0);
  // Unlimited + unused categories stay reachable (collapsed) so a limit can be
  // set before spending starts
  const idleNoLimit = catsWithoutLimit.filter((c) => c.spent <= 0);

  const isOverBudget = budget.remaining < 0;

  // Gauge fill + status color: personal accent while healthy, then amber →
  // orange → red as spending approaches/exceeds the budget
  const pctFrac = budget.spentPct / 100;
  const fillT = Math.min(1, Math.max(pctFrac, 0.02));
  const gaugeColor =
    pctFrac > 1
      ? 'var(--color-danger)'
      : pctFrac >= 0.8
        ? BUDGET_STATUS_COLORS.danger
        : pctFrac >= 0.6
          ? BUDGET_STATUS_COLORS.warning
          : 'var(--color-accent)';

  const renderNoLimitRow = (cat: CategoryBudgetItem, i: number) => {
    const isSettingThis = budget.settingLimitFor === cat.id;
    return (
      <div key={cat.id} className={cn(i > 0 && "border-t border-white/6")}>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div
            className="size-10 rounded-[14px] flex items-center justify-center shrink-0"
            style={{ background: tint(cat.color, 16) }}
          >
            <CategoryIcon icon={cat.icon} size={19} color={cat.color} />
          </div>
          <span className="flex-1 text-[14px] text-text font-bold truncate">
            {cat.name}
          </span>
          <div className="text-right flex items-center gap-4">
            {cat.spent > 0 && (
              <span className="text-[13px] font-num font-bold text-text-muted">
                {formatShort(cat.spent)}
              </span>
            )}
            {!isSettingThis && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  budget.openSetLimit(cat);
                }}
                aria-label={`Đặt giới hạn cho ${cat.name}`}
                className={pillActionClass}
                style={pillActionStyle}
              >
                Đặt giới hạn
              </button>
            )}
          </div>
        </div>

        {isSettingThis && (
          <div className="px-4 pb-4">
            <LimitEditor budget={budget} cat={cat} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-1 pb-32 animate-in fade-in duration-150">
      {/* Gauge overview card — soft glass */}
      <div className="glass rounded-[24px] relative overflow-hidden">
        {/* Accent glow behind the gauge */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-10 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(var(--color-accent-rgb), 0.22) 0%, transparent 65%)', filter: 'blur(24px)' }}
        />

        {/* Gauge — status-colored arc with progress knob */}
        <div className="pt-6 flex justify-center relative w-full">
          <svg
            viewBox="0 0 240 200"
            className="w-[260px] max-w-full"
            role="img"
            aria-label={`Đã dùng ${Math.round(budget.spentPct)}% ngân sách tháng này`}
          >
            {/* Track */}
            <path d={GAUGE_TRACK} fill="none" stroke="var(--color-border)"
              strokeWidth={G_STROKE} strokeLinecap="round" />

            {/* Fill */}
            <motion.path
              d={gaugeArc(0, fillT)}
              fill="none" stroke={gaugeColor}
              strokeWidth={G_STROKE} strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />

            {/* Progress knob riding the arc */}
            <motion.g
              style={{ transformOrigin: `${G_CX}px ${G_CY}px` }}
              initial={{ rotate: 0 }}
              animate={{ rotate: fillT * G_SWEEP }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.85, delay: 0.1 }}
            >
              <circle cx={gaugePolar(0).x} cy={gaugePolar(0).y} r={13} fill="var(--color-bg)" />
              <circle cx={gaugePolar(0).x} cy={gaugePolar(0).y} r={10} fill="var(--color-text)" />
              <circle cx={gaugePolar(0).x} cy={gaugePolar(0).y} r={4.5} fill={gaugeColor} />
            </motion.g>
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-5 pointer-events-none">
            <span className="text-[11px] font-bold text-text-muted mb-1">Sử dụng</span>
            <span
              className="font-black font-num leading-none"
              style={{ fontSize: '48px', color: gaugeColor }}
            >
              {Math.round(budget.spentPct)}%
            </span>
          </div>
        </div>

        {/* Stats — spent (neutral) vs remaining (semantic) */}
        <div className="flex gap-2.5 px-4 pb-3 mt-1 relative">
          <div className="flex-1 rounded-[18px] px-4 py-3 bg-white/5 border border-white/8">
            <p className="text-[11px] font-bold text-text-muted mb-1">Tổng chi</p>
            <p className="font-num text-[18px] font-black text-text leading-none">{formatVND(budget.totalSpent)}đ</p>
          </div>
          <div
            className={cn(
              "flex-1 rounded-[18px] px-4 py-3 text-right border",
              isOverBudget ? "bg-danger-bg border-danger/20" : "bg-success-bg border-success/20",
            )}
          >
            <p className={cn("text-[11px] font-bold mb-1", isOverBudget ? 'text-danger' : 'text-success')}>
              {isOverBudget ? "Vượt ngân sách" : "Còn lại"}
            </p>
            <p className={cn("font-num text-[18px] font-black leading-none", isOverBudget ? 'text-danger' : 'text-success')}>
              {isOverBudget ? "-" : ""}{formatVND(Math.abs(budget.remaining))}đ
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-2 px-5 pb-4 text-[11px] text-text-muted font-medium relative">
          <span>Ngân sách <span className="font-num text-text font-bold">{formatVND(budget.flexAmount)}đ</span></span>
          <span className="text-right">
            Còn {budget.daysLeft} ngày &middot;{' '}
            {budget.dailyAllowance != null ? (
              <span className="font-num text-text font-bold">~{formatVND(Math.round(budget.dailyAllowance))}đ/ngày</span>
            ) : (
              <span className="text-danger font-bold">Đã vượt</span>
            )}
          </span>
        </div>
      </div>

      {/* Category budget list */}
      {catsWithLimit.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="px-1 pt-1 flex items-center justify-between">
            <span className="section-title">Theo danh mục</span>
            <span className="text-[11px] font-num text-text-hint">{catsWithLimit.length}</span>
          </div>

          {catsWithLimit.map((cat) => {
            const status = getBudgetStatus(cat.spent, cat.limitPerMonth);
            const statusColor = BUDGET_STATUS_COLORS[status];
            const isOver = status === 'over';
            // Healthy → category color; warning levels/over → status color
            const barColor = status === 'ok' ? cat.color : statusColor;
            const diff = cat.spent - cat.lastMonthSpent;
            const isIncrease = diff > 0;
            const diffAbs = Math.abs(diff);
            const isSettingThis = budget.settingLimitFor === cat.id;

            return (
              <div
                key={cat.id}
                className={cn(
                  "glass rounded-[24px] overflow-hidden",
                  isOver ? "!border-danger/30" : status === 'danger' ? "!border-amber-400/25" : ""
                )}
              >
                {/* Card body — tap to add a transaction in this category */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    openQuickAdd(undefined, cat.id);
                  }}
                  aria-label={`Thêm chi tiêu cho ${cat.name}`}
                  className="block w-full text-left p-4 pb-3 active-scale"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="size-11 rounded-[16px] flex items-center justify-center shrink-0"
                      style={{ background: tint(cat.color, 16), boxShadow: `inset 0 0 0 1px ${tint(cat.color, 25)}` }}
                    >
                      <CategoryIcon icon={cat.icon} size={22} color={cat.color} />
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
                        Giới hạn {formatShort(cat.limitPerMonth!)}
                      </p>
                    </div>
                    <div
                      className="text-[13px] font-black font-num px-2.5 py-1 rounded-full"
                      style={{
                        color: status === 'ok' ? 'var(--color-text-muted)' : statusColor,
                        background: status === 'ok' ? 'rgba(255,255,255,0.05)' : tint(statusColor, 14),
                      }}
                    >
                      {formatBudgetPct(cat.pct)}
                    </div>
                  </div>

                  <div className="h-2 bg-white/8 rounded-full overflow-hidden mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: Math.min(100, cat.pct) + "%" }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${tint(barColor, 55)}, ${barColor})` }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-text-hint font-semibold mb-0.5">Đã chi</span>
                      <span className="text-[14px] font-bold text-text font-num">{formatShort(cat.spent)}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[11px] text-text-hint font-semibold mb-0.5">
                        {cat.remaining >= 0 ? "Còn lại" : "Vượt mức"}
                      </span>
                      <span className={cn("text-[14px] font-bold font-num", cat.remaining >= 0 ? "text-success" : "text-danger")}>
                        {cat.remaining < 0 ? "-" : ""}{formatShort(Math.abs(cat.remaining))}
                      </span>
                    </div>
                  </div>

                  {isOver && (
                    <div className="mt-4 p-3 bg-danger/10 rounded-[16px] border border-danger/20 flex items-center gap-2.5">
                      <AlertCircle size={14} className="text-danger shrink-0" />
                      <span className="text-[12px] font-semibold text-danger leading-tight">
                        Vượt giới hạn {formatShort(Math.abs(cat.remaining))} tháng này
                      </span>
                    </div>
                  )}
                </button>

                {/* Limit actions — separate from the card body button */}
                <div className="px-4 pb-4">
                  {isSettingThis ? (
                    <LimitEditor budget={budget} cat={cat} />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        budget.openSetLimit(cat);
                      }}
                      aria-label={`Sửa giới hạn cho ${cat.name}`}
                      className={cn(pillActionClass, "flex items-center gap-1")}
                      style={pillActionStyle}
                    >
                      <Pencil size={11} aria-hidden />
                      Sửa giới hạn
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Categories without limit */}
      {catsWithoutLimit.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="section-title px-1 pt-1">Chưa đặt giới hạn</p>
          <div className="glass rounded-[24px] overflow-hidden">
            {spendingNoLimit.map(renderNoLimitRow)}

            {idleNoLimit.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setShowIdleCats((v) => !v);
                  }}
                  aria-expanded={showIdleCats}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 text-[13px] font-semibold text-text-muted",
                    spendingNoLimit.length > 0 && "border-t border-white/6",
                  )}
                >
                  <span>Danh mục chưa chi tiêu ({idleNoLimit.length})</span>
                  <ChevronDown
                    size={16}
                    aria-hidden
                    className={cn("transition-transform", showIdleCats && "rotate-180")}
                  />
                </button>
                {showIdleCats && (
                  <div className="border-t border-white/6">
                    {idleNoLimit.map(renderNoLimitRow)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {catsWithLimit.length === 0 && catsWithoutLimit.length === 0 && (
        <div className="glass rounded-[24px] flex flex-col items-center justify-center py-16 text-center">
          <BarChart3 size={40} className="text-text-hint mb-4" />
          <p className="text-[14px] font-bold text-text-muted">Chưa có danh mục</p>
        </div>
      )}
    </div>
  );
}
