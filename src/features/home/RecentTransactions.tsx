import * as React from 'react'
import { useState, useCallback, useMemo } from 'react'
import { formatVND, getVietnameseDateLabel, sumSpent, tint } from '@/lib/utils'
import { CategoryFilterChips } from '@/components/CategoryFilterChips'
import { NoteBadge } from '@/components/NoteBadge'
import { TransactionDetailSheet } from '@/features/transactions/TransactionDetailSheet'
import type { HomeData } from '@/hooks/useHomeData'
import type { BudgetCategory, Transaction } from '@/types'
import { motion, useMotionValue, useTransform, animate, type PanInfo, AnimatePresence } from 'framer-motion'
import { Trash, ChevronRight, ReceiptText } from 'lucide-react'
import { CategoryIcon } from '@/components/CategoryIcon'
import { useTransactionStore } from '@/stores/transactionStore'
import { triggerHaptic } from '@/lib/haptic'

const SWIPE_HINT_KEY = 'mochi_swipe_hint_seen'

interface RecentTransactionsProps {
  transactions: HomeData['recentTransactions']
  onViewAll: () => void
}

type GroupedDay = {
  label: string
  date: string
  total: number
  items: HomeData['recentTransactions']
}

function groupByDate(transactions: HomeData['recentTransactions']): GroupedDay[] {
  const map = new Map<string, HomeData['recentTransactions']>()
  for (const tx of transactions) {
    const arr = map.get(tx.date) ?? []
    arr.push(tx)
    map.set(tx.date, arr)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      date,
      label: getVietnameseDateLabel(date),
      total: sumSpent(items),
      items,
    }))
}

// How many rows to show: 8 by default (as before), more when a category
// filter narrows the list down
const DEFAULT_VISIBLE = 8
const FILTERED_VISIBLE = 20

export const RecentTransactions = React.memo(({ transactions, onViewAll }: RecentTransactionsProps) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const handleSelect = useCallback((tx: Transaction) => setSelectedTx(tx), [])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [showSwipeHint, setShowSwipeHint] = useState(() =>
    !localStorage.getItem(SWIPE_HINT_KEY) && transactions.length > 0
  )

  // Categories present in the recent window, ordered by most recent use
  const activeCategories = useMemo(() => {
    const seen = new Map<number, BudgetCategory>()
    for (const tx of transactions) {
      if (tx.category?.id != null && !seen.has(tx.category.id)) {
        seen.set(tx.category.id, tx.category)
      }
    }
    return [...seen.values()]
  }, [transactions])

  // Reset the filter if its category left the recent window (e.g. last
  // transaction was deleted) — adjust state during render, not in an effect
  if (selectedCategoryId != null && !activeCategories.some((c) => c.id === selectedCategoryId)) {
    setSelectedCategoryId(null)
  }

  const visible = useMemo(() => {
    const filtered =
      selectedCategoryId != null
        ? transactions.filter((tx) => tx.categoryId === selectedCategoryId)
        : transactions
    return filtered.slice(0, selectedCategoryId != null ? FILTERED_VISIBLE : DEFAULT_VISIBLE)
  }, [transactions, selectedCategoryId])

  const groups = useMemo(() => groupByDate(visible), [visible])

  // Auto-dismiss swipe hint after 2.5s
  React.useEffect(() => {
    if (!showSwipeHint) return
    const t = setTimeout(() => {
      setShowSwipeHint(false)
      localStorage.setItem(SWIPE_HINT_KEY, '1')
    }, 2500)
    return () => clearTimeout(t)
  }, [showSwipeHint])

  return (
    <>
      <div className="px-4">
        {/* Section header */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold tracking-widest text-text-hint uppercase">
            Gần đây
          </p>
          {transactions.length > 0 && (
            <button
              type="button"
              onClick={onViewAll}
              className="flex items-center gap-0.5 text-[12px] text-accent-dark font-semibold active:opacity-60 transition-opacity"
            >
              Xem tất cả
              <ChevronRight size={13} className="mt-px" />
            </button>
          )}
        </div>

        {/* Category filter — edge-to-edge scroll, only useful with 2+ categories */}
        {activeCategories.length >= 2 && (
          <CategoryFilterChips
            className="-mx-4 mb-3"
            categories={activeCategories}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
            fadeFrom="from-surface"
          />
        )}

        {transactions.length === 0 ? (
          <div className="bg-card rounded-2xl py-10 flex flex-col items-center border border-border/60 shadow-sm gap-2">
            <ReceiptText size={32} className="text-text-hint" strokeWidth={1.5} />
            <p className="text-[13px] text-text-muted font-medium">Chưa có giao dịch nào</p>
            <p className="text-[11px] text-text-hint">Nhấn + để ghi chi tiêu đầu tiên</p>
          </div>
        ) : (
          // No keyed remount here: re-keying on filter change would unmount
          // and remount every swipeable row just to replay a fade.
          // min-height keeps the section from collapsing when a filter
          // shortens the list (prevents vertical scroll jumps).
          <div className={selectedCategoryId != null ? 'flex flex-col gap-3 min-h-[280px]' : 'flex flex-col gap-3'}>
            {groups.map((group) => (
              <div key={group.date}>
                {/* Day header */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[11px] font-bold text-text-muted">{group.label}</span>
                  <span className="font-num text-[11px] text-text-hint font-medium">
                    −{formatVND(group.total)}đ
                  </span>
                </div>

                {/* Transactions card */}
                <div className="bg-card rounded-2xl overflow-hidden border border-border/60 shadow-sm">
                  {group.items.map((tx, i) => (
                    <TransactionRow
                      key={tx.id}
                      tx={tx}
                      isLast={i === group.items.length - 1}
                      onSelect={handleSelect}
                      showSwipeHint={i === 0 && showSwipeHint}
                    />
                  ))}
                </div>
              </div>
            ))}
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
})

// Optimized TransactionRow with memo and high-performance drag logic
const TransactionRow = React.memo(({
  tx,
  isLast,
  onSelect,
  showSwipeHint = false,
}: {
  tx: HomeData['recentTransactions'][0]
  isLast: boolean
  onSelect: (tx: Transaction) => void
  showSwipeHint?: boolean
}) => {
  const catColor = tx.category?.color ?? 'var(--color-accent)'
  const { softDelete } = useTransactionStore()

  // Format createdAt as HH:mm
  const timeLabel = React.useMemo(() => {
    if (!tx.createdAt) return ''
    const d = new Date(tx.createdAt)
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
  }, [tx.createdAt])

  const x = useMotionValue(0)
  const [hasDragged, setHasDragged] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const bgOpacity = useTransform(x, [-60, 0], [1, 0])
  const iconScale = useTransform(x, [-60, -30], [1, 0.7])

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    triggerHaptic('heavy')
    setIsDeleting(true)
    setTimeout(() => { softDelete(tx.id!) }, 150)
  }, [tx.id, softDelete])

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 5) {
      setHasDragged(true)
      setTimeout(() => setHasDragged(false), 50)
    }
    if (info.offset.x < -60 || info.velocity.x < -400) {
      animate(x, -70, { type: 'spring', bounce: 0, duration: 0.3 })
      triggerHaptic('medium')
    } else {
      animate(x, 0, { type: 'spring', bounce: 0, duration: 0.3 })
    }
  }, [x])

  if (isDeleting) return null

  return (
    <div className="relative overflow-hidden w-full bg-card" style={{
      borderBottom: isLast ? 'none' : '0.5px solid var(--color-border)',
    }}>
      {/* Delete background */}
      <motion.div
        style={{ opacity: bgOpacity }}
        className="absolute inset-y-0 right-0 w-[70px] bg-danger flex items-center justify-center pointer-events-none"
      >
        <motion.div style={{ scale: iconScale }}>
          <Trash className="size-[20px] text-white" strokeWidth={2.5} />
        </motion.div>
      </motion.div>

      {/* Delete trigger */}
      <div className="absolute inset-y-0 right-0 w-[70px] z-20" onClick={handleDelete} />

      {/* Swipeable row */}
      <motion.button
        type="button"
        drag="x"
        dragConstraints={{ left: -70, right: 0 }}
        dragElastic={0.05}
        style={{ x }}
        onDragEnd={handleDragEnd}
        onClick={() => !hasDragged && onSelect(tx)}
        whileTap={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
        className="relative z-10 w-full flex items-center gap-3.5 px-4 py-3.5 text-left bg-card cursor-grab active:cursor-grabbing"
      >
        {/* Category icon */}
        <div
          className="shrink-0 flex items-center justify-center rounded-[12px] leading-none shadow-sm"
          style={{
            width: 40,
            height: 40,
            background: tint(catColor, 9),
          }}
        >
          <CategoryIcon icon={tx.category?.icon} size={18} color={tx.category?.color} className="text-text-muted" />
        </div>

        {/* Name + note/time */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="truncate text-[14px] font-semibold text-text leading-snug">
              {tx.category?.name ?? 'Không rõ'}
            </p>
            {tx.isNote && (
              <NoteBadge />
            )}
          </div>
          <p className="text-text-hint text-[11px] truncate">
            {tx.note ? `${tx.note} · ${timeLabel}` : timeLabel}
          </p>
        </div>

        {/* Amount */}
        <div className="shrink-0 flex items-baseline gap-0.5">
          {!tx.isNote && <span className="text-text-hint text-[12px] font-medium">−</span>}
          <span className={`font-num text-[14px] font-bold tracking-tight ${
            tx.isNote ? 'text-text-muted' : 'text-text'
          }`}>
            {formatVND(tx.amount)}đ
          </span>
        </div>
      </motion.button>

      {/* One-time swipe-to-delete discovery hint */}
      <AnimatePresence>
        {showSwipeHint && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex items-center gap-1 pointer-events-none"
          >
            <span className="text-[10px] font-bold text-danger/70">Vuốt ← xóa</span>
            <motion.span
              animate={{ x: [-3, -8, -3] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-danger/60"
            >
              ←
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
