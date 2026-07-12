import { CategoryFilterChips } from '@/components/CategoryFilterChips'
import { CloseButton } from '@/components/CloseButton'
import { NoteBadge } from '@/components/NoteBadge'
import { TransactionDetailSheet } from '@/features/transactions/TransactionDetailSheet'
import { useHistory, type TransactionWithCategory } from '@/hooks/useHistory'
import { useShouldShowSkeleton } from '@/hooks/useShouldShowSkeleton'
import { formatVND, getDateLabel, sumSpent, tint } from '@/lib/utils'
import type { Transaction } from '@/types'
import { animate, motion, useMotionValue, type PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight, FolderOpen, Trash } from 'lucide-react'
import { CategoryIcon } from '@/components/CategoryIcon'
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
        whileTap={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
        className="flex min-h-[58px] items-center gap-3 px-3 py-3 bg-card transition-colors cursor-grab active:cursor-grabbing text-left w-full relative z-10"
      >
        <div
          className="shrink-0 flex items-center justify-center rounded-[12px] border border-border/40"
          style={{
            width: 40,
            height: 40,
            background: tx.category?.color ? tint(tx.category.color, 8) : 'var(--color-surface2)',
          }}
        >
          <CategoryIcon
            icon={tx.category?.icon}
            size={18}
            color={tx.category?.color ?? 'var(--color-text-muted)'}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="truncate text-[14px] font-bold text-text">
              {tx.category?.name ?? 'Không rõ'}
            </p>
            {tx.isNote && (
              <NoteBadge />
            )}
          </div>
          <p className="font-num text-[11px] text-text-hint truncate opacity-90">
            {getDateLabel(tx.date)}
            {tx.note ? ` · ${tx.note}` : ''}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          {!tx.isNote && (
            <span className="text-text-muted text-[13px] font-medium opacity-60">−</span>
          )}
          <span
            className={`font-num text-[15px] font-black tracking-tight ${
              tx.isNote ? 'text-text-muted' : 'text-text'
            }`}
          >
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
            className="flex size-10 items-center justify-center rounded-full bg-surface active:bg-surface2 transition-colors disabled:opacity-30"
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
            className="flex size-10 items-center justify-center rounded-full bg-surface active:bg-surface2 transition-colors disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Category filter chips */}
        {history.activeCategories.length > 0 && (
          <CategoryFilterChips
            className="mb-3"
            categories={history.activeCategories}
            selectedId={history.selectedCategoryId}
            onSelect={history.setSelectedCategoryId}
          />
        )}

        {/* Active filter summary header */}
        {history.selectedCategoryId != null && history.selectedCategory && (
          <div
            className="mx-4 mb-3 p-3 rounded-xl flex items-center gap-3"
            style={{ background: tint(history.selectedCategory.color, 8) }}
          >
            <CategoryIcon
              icon={history.selectedCategory.icon}
              size={24}
              color={history.selectedCategory.color}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: history.selectedCategory.color }}>
                {history.selectedCategory.name}
              </p>
              <p className="text-xs text-text-muted font-num">
                {history.filteredTransactions.length} giao dịch ·{' '}
                {formatVND(history.filteredTotal)}đ
              </p>
            </div>
            <CloseButton
              label="Bỏ lọc danh mục"
              onClick={() => history.setSelectedCategoryId(null)}
            />
          </div>
        )}

        {/* Transaction list — reserved height so switching filters can't
            collapse the page and cause a vertical scroll jump */}
        <div className="min-h-[55dvh]">
        {history.filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <FolderOpen size={40} className="text-text-hint mb-3" />
            <p className="text-[14px] font-medium text-text-muted">
              {history.selectedCategoryId
                ? 'Không có giao dịch cho danh mục này'
                : 'Chưa có giao dịch tháng này'}
            </p>
          </div>
        ) : (
          // No keyed remount here: re-keying on filter change would unmount
          // and remount every swipeable row just to replay a fade
          <div className="mx-4 rounded-[16px] border border-border bg-card overflow-hidden">
            {groups.map(([date, txs], groupIdx) => {
              const dayTotal = sumSpent(txs)
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
