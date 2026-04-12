import { TransactionDetailSheet } from '@/features/transactions/TransactionDetailSheet'
import { useHistory, type TransactionWithCategory } from '@/hooks/useHistory'
import { useShouldShowSkeleton } from '@/hooks/useShouldShowSkeleton'
import { triggerHaptic } from '@/lib/haptic'
import { cn, formatVND, getDateLabel } from '@/lib/utils'
import type { Transaction } from '@/types'
import { animate, motion, useMotionValue, type PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight, Trash, X } from 'lucide-react'
import * as React from 'react'
import { useCallback, useState } from 'react'
import { HistorySkeleton } from './HistorySkeleton'

// ── Transaction row ────────────────────────────────────────────

function TxRow({
  tx,
  onSelect,
}: {
  tx: TransactionWithCategory
  onSelect: (tx: Transaction) => void
}) {
  const x = useMotionValue(0)
  const [hasDragged, setHasDragged] = React.useState(false)

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 10) {
      setHasDragged(true)
      setTimeout(() => setHasDragged(false), 50)
    }

    if (info.offset.x < -20 || info.point.x < -20) {
      animate(x, -64, { type: 'spring', bounce: 0.2, duration: 0.3 })
    } else {
      animate(x, 0, { type: 'spring', bounce: 0.2, duration: 0.3 })
    }
  }

  return (
    <div className="relative w-full bg-danger overflow-hidden">
      {/* Background delete layer */}
      <div className="absolute inset-y-0 right-0 w-[64px] flex items-center justify-center">
        <Trash className="size-4 text-white" />
      </div>

      <motion.button
        type="button"
        drag="x"
        dragConstraints={{ left: -64, right: 0 }}
        dragElastic={0.05}
        style={{ x }}
        onDragEnd={handleDragEnd}
        onClick={(e) => {
          if (hasDragged) return
          if (Math.abs(x.get()) > 5) {
            animate(x, 0, { type: 'spring', bounce: 0, duration: 0.3 })
            e.preventDefault()
            return
          }
          onSelect(tx)
        }}
        whileTap={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
        className="flex min-h-[58px] items-center gap-3 px-3 py-3 bg-white transition-colors cursor-grab active:cursor-grabbing text-left w-full relative z-10"
      >
        <div
          className="shrink-0 flex items-center justify-center rounded-[12px] text-xl border border-border/40"
          style={{
            width: 40,
            height: 40,
            background: tx.category?.color ? tx.category.color + '15' : '#F2F0EC',
            color: tx.category?.color ?? 'var(--color-text-muted)',
          }}
        >
          {tx.category?.icon ?? '📦'}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold text-text mb-0.5">
            {tx.category?.name ?? 'Không rõ'}
          </p>
          <p className="font-num text-[11px] text-text-hint truncate opacity-90">
            {getDateLabel(tx.date)}
            {tx.note ? ` · ${tx.note}` : ''}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <span className="text-text-muted text-[13px] font-medium opacity-60">−</span>
          <span className="font-num text-[15px] font-black text-text tracking-tight">
            {formatVND(tx.amount)}đ
          </span>
        </div>
      </motion.button>
    </div>
  )
}

// ── Group transactions by date ─────────────────────────────────

function groupByDate(txs: TransactionWithCategory[]): [string, TransactionWithCategory[]][] {
  const map = new Map<string, TransactionWithCategory[]>()
  for (const tx of txs) {
    if (!map.has(tx.date)) map.set(tx.date, [])
    map.get(tx.date)!.push(tx)
  }
  return [...map.entries()]
}

// ── Main HistoryTab ────────────────────────────────────────────

export function HistoryTab() {
  const history = useHistory()
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  const handleSelect = useCallback((tx: Transaction) => setSelectedTx(tx), [])

  const groups = groupByDate(history.filteredTransactions)

  // Month navigation
  const currentIdx = history.monthKeys.indexOf(history.selectedMonth)
  const canGoBack = currentIdx < history.monthKeys.length - 1
  const canGoForward = currentIdx > 0

  const showSkeleton = useShouldShowSkeleton(history.isLoading)

  if (showSkeleton) return <HistorySkeleton />

  return (
    <>
      <div className="flex flex-col pb-32 pt-2 animate-in fade-in duration-150">

        {/* Month navigation row */}
        <div className="flex items-center justify-between px-4 pt-2 pb-3">
          <button
            type="button"
            onClick={() => canGoBack && history.setSelectedMonth(history.monthKeys[currentIdx + 1])}
            disabled={!canGoBack}
            className="flex size-8 items-center justify-center rounded-full bg-surface active:bg-surface2 transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="text-center">
            <p className="text-[15px] font-semibold text-text">{history.monthLabel}</p>
            <p className="font-num text-[12px] text-text-muted mt-0.5">
              {formatVND(history.monthTotal)}đ tổng chi
            </p>
          </div>

          <button
            type="button"
            onClick={() => canGoForward && history.setSelectedMonth(history.monthKeys[currentIdx - 1])}
            disabled={!canGoForward}
            className="flex size-8 items-center justify-center rounded-full bg-surface active:bg-surface2 transition-colors disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Category filter pills - Elite Scroll Version */}
        {history.activeCategories.length > 0 && (
          <div className="relative mb-4">
             {/* Edge Fades for visual depth */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-bg to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-bg to-transparent z-10 pointer-events-none" />

            <div
              className="flex gap-2.5 overflow-x-auto px-4 pb-1 snap-x scrollbar-hide touch-pan-x"
              style={{ WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain' }}
            >
              {/* All chip */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                animate={!history.selectedCategoryId ? { scale: 1.05 } : { scale: 1 }}
                onClick={() => {
                   triggerHaptic('light');
                   history.setSelectedCategoryId(null);
                }}
                className={cn(
                  "snap-start shrink-0 flex items-center h-10 px-5 rounded-full border-[1.5px] transition-all",
                  !history.selectedCategoryId 
                    ? "bg-text text-white shadow-md z-10" 
                    : "bg-white border-border text-text-muted hover:bg-surface"
                )}
              >
                <span className="text-[13px] font-black tracking-tight">Tất cả</span>
              </motion.button>

              {history.activeCategories.map((cat) => {
                const isActive = history.selectedCategoryId === cat.id
                return (
                  <motion.button
                    key={cat.id}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                    onClick={() => {
                        triggerHaptic('light');
                        history.setSelectedCategoryId(isActive ? null : cat.id!);
                    }}
                    className={cn(
                      "snap-start shrink-0 flex items-center gap-2 h-10 px-4 rounded-full border-[1.5px] transition-all",
                      isActive 
                        ? "bg-white shadow-md z-10" 
                        : "bg-white border-border text-text-muted hover:bg-surface"
                    )}
                    style={{
                      borderColor: isActive ? cat.color : undefined,
                      backgroundColor: isActive ? `${cat.color}10` : undefined,
                      color: isActive ? cat.color : undefined,
                    }}
                  >
                    <span className="text-lg translate-y-[0.5px]">{cat.icon}</span>
                    <span className="text-[13px] font-black whitespace-nowrap tracking-tight">
                        {cat.name}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        )}

        {/* Active filter summary header */}
        {history.selectedCategoryId != null && history.selectedCategory && (
          <div
            className="mx-4 mb-3 p-3 rounded-xl flex items-center gap-3"
            style={{ background: history.selectedCategory.color + '15' }}
          >
            <span style={{ fontSize: 24 }}>{history.selectedCategory.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: history.selectedCategory.color }}>
                {history.selectedCategory.name}
              </p>
              <p className="text-xs text-text-muted font-num">
                {history.filteredTransactions.length} giao dịch ·{' '}
                {formatVND(history.filteredTotal)}đ
              </p>
            </div>
            <button
              type="button"
              onClick={() => history.setSelectedCategoryId(null)}
              className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm active:scale-95 transition-transform"
            >
              <X size={13} className="text-text-muted" />
            </button>
          </div>
        )}

        {/* Transaction list */}
        {history.filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <span className="text-4xl mb-3">🗂️</span>
            <p className="text-[14px] font-medium text-text-muted">
              {history.selectedCategoryId
                ? 'Không có giao dịch cho danh mục này'
                : 'Chưa có giao dịch tháng này'}
            </p>
          </div>
        ) : (
          <div className="mx-4 rounded-[16px] border border-border bg-white overflow-hidden">
            {groups.map(([date, txs], groupIdx) => {
              const dayTotal = txs.reduce((s, t) => s + t.amount, 0)
              return (
                <div key={date} className={groupIdx > 0 ? 'border-t border-border' : ''}>
                  {/* Date header */}
                  <div className="flex items-center justify-between px-3 py-2 bg-bg">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-text-hint">
                      {getDateLabel(date)}
                    </span>
                    <span className="font-num text-[11px] text-text-muted">
                      −{formatVND(dayTotal)}đ
                    </span>
                  </div>

                  {/* Transactions for that day */}
                  <div className="px-1">
                    {txs.map((tx) => (
                      <TxRow key={tx.id} tx={tx} onSelect={handleSelect} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <TransactionDetailSheet
        open={!!selectedTx}
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onUpdated={() => setSelectedTx(null)}
        onDeleted={() => setSelectedTx(null)}
      />
    </>
  )
}
