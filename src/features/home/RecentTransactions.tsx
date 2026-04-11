import * as React from 'react'
import { useState, useCallback } from 'react'
import { formatVND, getVietnameseDateLabel } from '@/lib/utils'
import { TransactionDetailSheet } from '@/features/transactions/TransactionDetailSheet'
import type { HomeData } from '@/hooks/useHomeData'
import type { Transaction } from '@/types'
import { motion, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion'
import { Trash } from 'lucide-react'
import { useTransactionStore } from '@/stores/transactionStore'
import { triggerHaptic } from '@/lib/haptic'

interface RecentTransactionsProps {
  transactions: HomeData['recentTransactions']
  onViewAll: () => void
}

// Optimized RecentTransactions with memo and lightweight entrance
export const RecentTransactions = React.memo(({ transactions, onViewAll }: RecentTransactionsProps) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  const handleSelect = useCallback((tx: Transaction) => {
    setSelectedTx(tx)
  }, [])

  return (
    <>
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold tracking-widest text-text-hint uppercase">
            Gần đây
          </p>
          {transactions.length > 0 && (
            <button
              type="button"
              onClick={onViewAll}
              className="text-[12px] text-accent font-medium active:opacity-60 transition-opacity"
            >
              Xem tất cả →
            </button>
          )}
        </div>

        {transactions.length === 0 ? (
          <div
            className="bg-white rounded-2xl py-8 flex flex-col items-center border border-border/60 shadow-sm"
          >
            <p className="text-2xl mb-2">🧾</p>
            <p className="text-[13px] text-text-muted">Chưa có giao dịch nào</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden border border-border/60 shadow-sm">
            {transactions.map((tx, i) => (
               <TransactionRow
                  key={tx.id}
                  tx={tx}
                  isLast={i === transactions.length - 1}
                  onSelect={handleSelect}
                />
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
}: {
  tx: HomeData['recentTransactions'][0]
  isLast: boolean
  onSelect: (tx: Transaction) => void
}) => {
  const catColor = tx.category?.color ?? 'var(--color-accent)'
  const { softDelete } = useTransactionStore()
  
  const x = useMotionValue(0)
  const [hasDragged, setHasDragged] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Memoize transforms to avoid re-calculation during drag
  const bgOpacity = useTransform(x, [-60, 0], [1, 0])
  const iconScale = useTransform(x, [-60, -30], [1, 0.7])

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    triggerHaptic('heavy')
    setIsDeleting(true)
    setTimeout(() => {
      softDelete(tx.id!)
    }, 150)
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
    <div className="relative overflow-hidden w-full bg-white" style={{
      borderBottom: isLast ? 'none' : '0.5px solid var(--color-border)',
    }}>
      {/* Background layer - optimized with simpler values */}
      <motion.div 
        style={{ opacity: bgOpacity }}
        className="absolute inset-y-0 right-0 w-[70px] bg-danger flex items-center justify-center pointer-events-none"
      >
         <motion.div style={{ scale: iconScale }}>
            <Trash className="size-[20px] text-white" strokeWidth={2.5} />
         </motion.div>
      </motion.div>

      {/* Delete trigger overlay */}
      <div 
        className="absolute inset-y-0 right-0 w-[70px] z-20"
        onClick={handleDelete}
      />

      {/* Foreground swipable layer */}
      <motion.button
        type="button"
        drag="x"
        dragConstraints={{ left: -70, right: 0 }}
        dragElastic={0.05}
        style={{ x }}
        onDragEnd={handleDragEnd}
        onClick={() => !hasDragged && onSelect(tx)}
        whileTap={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
        className="relative z-10 w-full flex items-center gap-4 px-5 py-4 text-left bg-white cursor-grab active:cursor-grabbing"
      >
        <div
          className="shrink-0 flex items-center justify-center rounded-[12px] text-lg leading-none shadow-sm"
          style={{
            width: 42,
            height: 42,
            background: catColor + '15',
            color: catColor,
          }}
        >
          {tx.category?.icon ?? '📦'}
        </div>

        <div className="flex-1 min-w-0">
          <p className="truncate text-[15px] font-bold text-text mb-0.5">
            {tx.category?.name ?? 'Không rõ'}
          </p>
          <p className="font-num text-[11px] font-medium text-text-hint truncate opacity-90">
            {getVietnameseDateLabel(tx.date)}
            {tx.note ? ` · ${tx.note}` : ''}
          </p>
        </div>

        <div className="shrink-0 flex items-baseline gap-0.5">
          <span className="text-text-muted text-[13px] font-medium opacity-60">−</span>
          <span className="font-num text-[15px] font-black text-text tracking-tight">
            {formatVND(tx.amount)}đ
          </span>
        </div>
      </motion.button>
    </div>
  )
})
