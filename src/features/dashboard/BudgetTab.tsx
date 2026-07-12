import { useBudget } from "@/hooks/useBudget";
import { formatBudgetPct, formatShort, formatVND, cn, tint } from "@/lib/utils";
import { Settings2, TrendingUp, TrendingDown, AlertCircle, PiggyBank, BarChart3 } from "lucide-react";
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

// ── Budget Tab ─────────────────────────────────────────────────

export function BudgetTab() {
  const budget = useBudget();
  const openQuickAdd = useAppStore(s => s.openQuickAdd);
  const showSkeleton = useShouldShowSkeleton(budget.isLoading);

  if (showSkeleton) return <BudgetSkeleton />;

  if (!budget.isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 text-center animate-in fade-in duration-150">
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

  const catsWithoutLimit = budget.categoriesWithBudget.filter(
    (c) => !c.limitPerMonth && c.spent > 0,
  );

  // Gauge fill + status color: personal accent while healthy, then amber →
  // orange → red as spending approaches/exceeds the budget
  const pctFrac = budget.spentPct / 100;
  const fillT = Math.min(1, Math.max(pctFrac, 0.02));
  const gaugeColor =
    pctFrac > 1 ? '#EF4444' : pctFrac >= 0.8 ? '#FB923C' : pctFrac >= 0.6 ? '#FBBF24' : 'var(--color-accent)';

  return (
    <div className="flex-1 overflow-y-auto bg-bg px-4 py-4 scrollbar-hide pb-32 pt-2 animate-in fade-in duration-150 mesh-gradient min-h-full">
      {/* Gauge overview card — 3D Liquid Glass */}
      <div
        className="mb-6 rounded-[32px] relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(30,42,77,0.85) 0%, rgba(22,33,62,0.65) 100%)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1.5px solid rgba(255,255,255,0.08)',
          boxShadow: '0 16px 56px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* Floating ambient orbs — larger and more vivid */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,179,237,0.22) 0%, transparent 65%)', filter: 'blur(28px)' }}
        />
        <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.18) 0%, transparent 65%)', filter: 'blur(24px)' }}
        />
        <div className="absolute left-1/2 -translate-x-1/2 top-4 w-48 h-24 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)', filter: 'blur(20px)' }}
        />
        {/* Top inner gloss */}
        <div className="absolute top-0 inset-x-0 h-[40%] bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-[32px]" />

        {/* Gauge — status-colored arc with progress knob */}
        <div className="pt-6 flex justify-center relative w-full">
          <svg
            viewBox="0 0 240 200"
            className="w-[260px] max-w-full"
            role="img"
            aria-label={`Đã dùng ${Math.round(budget.spentPct)}% ngân sách tháng này`}
          >
            {/* Track */}
            <path d={GAUGE_TRACK} fill="none" stroke="rgba(255,255,255,0.08)"
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
              <circle cx={gaugePolar(0).x} cy={gaugePolar(0).y} r={13} fill="var(--color-card)" />
              <circle cx={gaugePolar(0).x} cy={gaugePolar(0).y} r={10} fill="#F8FAFC" />
              <circle cx={gaugePolar(0).x} cy={gaugePolar(0).y} r={4.5} fill={gaugeColor} />
            </motion.g>
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-5 pointer-events-none">
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-text-hint mb-1">Sử dụng</span>
            <span
              className="font-black font-num leading-none"
              style={{ fontSize: '48px', color: gaugeColor }}
            >
              {Math.round(budget.spentPct)}%
            </span>
          </div>
        </div>

        {/* Stats — spent (neutral) vs remaining (semantic) */}
        <div className="flex gap-3 px-5 pb-4 mt-1">
          <div className="flex-1 rounded-2xl px-4 py-3 bg-white/4 border border-border/60">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-text-muted mb-1">Tổng chi</p>
            <p className="font-num text-[18px] font-black text-text leading-none">{formatVND(budget.totalSpent)}đ</p>
          </div>
          <div className="flex-1 rounded-2xl px-4 py-3 text-right"
            style={{
              background: budget.flexAmount - budget.totalSpent >= 0 ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)',
              border: budget.flexAmount - budget.totalSpent >= 0 ? '1px solid rgba(16,185,129,0.15)' : '1px solid rgba(239,68,68,0.15)',
            }}
          >
            <p className={cn("text-[9px] font-black uppercase tracking-[0.15em] mb-1",
              budget.flexAmount - budget.totalSpent >= 0 ? 'text-success' : 'text-danger'
            )}>Còn lại</p>
            <p className={cn("font-num text-[18px] font-black leading-none",
              budget.flexAmount - budget.totalSpent >= 0 ? 'text-success' : 'text-danger'
            )}>{formatVND(Math.max(0, budget.flexAmount - budget.totalSpent))}đ</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 pb-6 text-[11px] text-text-muted font-medium">
          <span>Ngân sách <span className="font-num text-text font-bold">{formatShort(budget.flexAmount)}</span></span>
          <span>Còn {budget.daysLeft} ngày &middot; <span className="text-text font-bold">~{formatShort(budget.dailyAllowance)}/ngày</span></span>
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
            const status = getBudgetStatus(cat.spent, cat.limitPerMonth);
            const statusColor = BUDGET_STATUS_COLORS[status];
            const isOver = status === 'over';
            const diff = cat.spent - cat.lastMonthSpent;
            const isIncrease = diff > 0;
            const diffAbs = Math.abs(diff);

            return (
              <div
                key={cat.id}
                onClick={() => openQuickAdd(undefined, cat.id)}
                className={cn(
                  "p-5 bg-card rounded-[32px] shadow-premium border transition-all active-scale cursor-pointer",
                  isOver ? "border-danger/20" : status === 'danger' ? "border-amber-400/20" : "border-border"
                )}
              >
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className="size-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 border border-border/40"
                    style={{ background: tint(cat.color, 8) }}
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
                      Giới hạn {formatVND(cat.limitPerMonth!)}đ
                    </p>
                  </div>
                  <div
                    className="text-[13px] font-black"
                    style={{ color: status === 'ok' ? 'var(--color-text-muted)' : statusColor }}
                  >
                    {formatBudgetPct(cat.pct)}
                  </div>
                </div>

                <div className="h-2.5 bg-surface2 rounded-full overflow-hidden mb-5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: Math.min(100, cat.pct) + "%" }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: statusColor }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-hint uppercase tracking-widest font-bold mb-0.5">Đã chi</span>
                    <span className="text-[14px] font-bold text-text font-num">{formatShort(cat.spent)}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-text-hint uppercase tracking-widest font-bold mb-0.5">
                      {cat.remaining >= 0 ? "Còn lại" : "Vượt mức"}
                    </span>
                    <span className={cn("text-[14px] font-bold font-num", cat.remaining >= 0 ? "text-success" : "text-danger")}>
                      {formatShort(Math.abs(cat.remaining))}
                    </span>
                  </div>
                </div>

                {isOver && (
                  <div className="mt-5 p-3 bg-danger/5 rounded-2xl border border-danger/10 flex items-center gap-2.5">
                    <AlertCircle size={14} className="text-danger shrink-0" />
                    <span className="text-[12px] font-semibold text-danger leading-tight">
                      Vượt giới hạn {formatShort(Math.abs(cat.remaining))} tháng này
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
          <div className="bg-card rounded-[32px] overflow-hidden border border-border shadow-premium">
            {catsWithoutLimit.map((cat, i) => {
              const isSettingThis = budget.settingLimitFor === cat.id;
              return (
                <div key={cat.id} className={cn(i > 0 && "border-t border-border/50")}>
                  <div className="flex items-center gap-4 px-5 py-4">
                    <CategoryIcon icon={cat.icon} size={22} color={cat.color} />
                    <span className="flex-1 text-[14px] text-text font-bold truncate">
                      {cat.name}
                    </span>
                    <div className="text-right flex items-center gap-4">
                      <span className="text-[13px] font-num font-bold text-text-muted">
                        {formatShort(cat.spent)}
                      </span>
                      {!isSettingThis && (
                        <button
                          type="button"
                          onClick={() => budget.openSetLimit(cat)}
                          className="text-[11px] text-white font-bold px-3 py-2 rounded-xl bg-accent active:scale-95 transition-all"
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
                          enterKeyHint="done"
                          autoFocus
                          placeholder="Nhập số tiền..."
                          value={budget.limitInput}
                          onChange={(e) => budget.handleLimitInputChange(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") budget.saveLimit(cat.id!, budget.limitAmount);
                            if (e.key === "Escape") budget.setSettingLimitFor(null);
                          }}
                          className="flex-1 min-w-0 bg-transparent px-3 py-2 text-[14px] font-bold text-text focus:outline-none"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => budget.setSettingLimitFor(null)}
                            className="px-2 py-2 text-[12px] font-bold text-text-hint active:scale-95 transition-transform"
                          >
                            Huỷ
                          </button>
                          <button
                            type="button"
                            onClick={() => budget.saveLimit(cat.id!, budget.limitAmount)}
                            className="px-4 py-2 bg-accent text-white text-[12px] font-bold rounded-xl shadow-sm whitespace-nowrap active:scale-95 transition-transform"
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
          <BarChart3 size={40} className="text-text-hint mb-4" />
          <p className="text-[14px] font-bold text-text-muted">Chưa có dữ liệu chi tiêu</p>
        </div>
      )}
    </div>
  );
}
