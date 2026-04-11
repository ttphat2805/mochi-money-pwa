import { useBudget } from "@/hooks/useBudget";
import { formatBudgetPct, formatShort, formatVND, cn } from "@/lib/utils";
import { Settings2, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { useShouldShowSkeleton } from "@/hooks/useShouldShowSkeleton";
import { BudgetSkeleton } from "./BudgetSkeleton";
import { motion } from "framer-motion";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// ── Small helpers ──────────────────────────────────────────────


// ── Budget Tab ─────────────────────────────────────────────────

export function BudgetTab() {
  const budget = useBudget();
  const openQuickAdd = useAppStore(s => s.openQuickAdd);
  const showSkeleton = useShouldShowSkeleton(budget.isLoading);

  if (showSkeleton) return <BudgetSkeleton />;

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
  // Gauge geometry — compute fill arc end angle dynamically
  // so we use ONE slice (no remaining slice) → cornerRadius works perfectly
  const GAUGE_START = 215
  const GAUGE_SWEEP = 250  // total degrees of the gauge track
  const fillEndAngle = GAUGE_START - (Math.min(100, budget.spentPct) / 100) * GAUGE_SWEEP

  return (
    <div className="flex-1 overflow-y-auto bg-bg px-4 py-4 scrollbar-hide pb-32 pt-2 animate-in fade-in duration-150 mesh-gradient min-h-full">
      {/* Gauge overview card — 3D Liquid Glass */}
      <div
        className="mb-6 rounded-[32px] relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.65) 100%)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1.5px solid rgba(255,255,255,0.75)',
          boxShadow: '0 16px 56px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.95)',
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
        <div className="absolute top-0 inset-x-0 h-[40%] bg-gradient-to-b from-white/80 to-transparent pointer-events-none rounded-t-[32px]" />

        {/* Gauge chart — bigger and bolder */}
        <div className="pt-6 h-[280px] flex justify-center items-center relative w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart style={{ outline: 'none' }}>
              <defs>
                <linearGradient id="gauge-liquid" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--color-success)" stopOpacity={1} />
                  <stop offset="60%" stopColor="var(--color-accent)" stopOpacity={1} />
                  <stop offset="100%" stopColor="var(--color-danger)" stopOpacity={1} />
                </linearGradient>
                <filter id="gauge-3d" x="-25%" y="-25%" width="150%" height="150%">
                  <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="var(--color-accent)" floodOpacity="0.28" />
                </filter>
              </defs>

              {/* Track — static background arc */}
              <Pie
                data={[{ value: 1 }]}
                cx="50%" cy="60%"
                startAngle={215} endAngle={-35}
                innerRadius="55%" outerRadius="80%"
                dataKey="value"
                stroke="none"
                isAnimationActive={false}
              >
                <Cell fill="rgba(0,0,0,0.07)" style={{ outline: 'none' }} />
              </Pie>

              {/* Fill — single slice with proper cornerRadius */}
              <Pie
                data={[{ value: 1 }]}
                cx="50%" cy="60%"
                startAngle={GAUGE_START}
                endAngle={fillEndAngle}
                innerRadius="55%" outerRadius="80%"
                dataKey="value"
                stroke="none"
                cornerRadius={14}
                isAnimationActive={true}
                animationDuration={1000}
                animationBegin={100}
              >
                <Cell fill="url(#gauge-liquid)" filter="url(#gauge-3d)" style={{ outline: 'none', cursor: 'default' }} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingTop: '40px' }}>
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-text-hint mb-1">Sử dụng</span>
            <span
              className="font-black font-num leading-none"
              style={{
                fontSize: '52px',
                color: 'var(--color-accent)',
              }}
            >
              {Math.round(budget.spentPct)}%
            </span>
          </div>
        </div>

        {/* Stats — two premium pill cards */}
        <div className="flex gap-3 px-5 pb-4 mt-1">
          <div className="flex-1 rounded-2xl px-4 py-3 relative overflow-hidden"
            style={{
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.15)',
            }}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-danger mb-1">Tổng chi</p>
            <p className="font-num text-[18px] font-black text-danger leading-none">{formatVND(budget.totalSpent)}đ</p>
          </div>
          <div className="flex-1 rounded-2xl px-4 py-3 relative overflow-hidden text-right"
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

        {/* 3D Liquid progress bar */}
        <div className="mx-6 h-4 rounded-full overflow-hidden p-[2px] mb-3"
          style={{ background: 'rgba(0,0,0,0.07)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)' }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: Math.min(100, budget.spentPct) + '%' }}
            transition={{ duration: 1, type: 'spring', bounce: 0 }}
            className="h-full rounded-full relative"
            style={{
              background: (budget.flexAmount - budget.totalSpent < 0)
                ? 'var(--color-danger)'
                : 'linear-gradient(90deg, var(--color-success), var(--color-accent))',
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -2px 3px rgba(0,0,0,0.12)',
            }}
          >
            <div className="absolute top-0 left-0 w-full h-[45%] bg-gradient-to-b from-white/65 to-white/5 rounded-t-full pointer-events-none" />
            <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-white/35 to-transparent rounded-r-full pointer-events-none mix-blend-overlay" />
          </motion.div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 pb-6 text-[11px] text-text-muted font-medium">
          <span className="font-num">{formatBudgetPct(budget.spentPct)} đã dùng</span>
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
                        {formatShort(cat.spent)}
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
