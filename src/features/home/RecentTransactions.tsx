import { useState, useCallback } from 'react'
import { formatVND, getVietnameseDateLabel } from '@/lib/utils'
import { TransactionDetailSheet } from '@/features/transactions/TransactionDetailSheet'
import type { HomeData } from '@/hooks/useHomeData'
import type { Transaction } from '@/types'

interface RecentTransactionsProps {
  transactions: HomeData['recentTransactions']
  onViewAll: () => void
}

export function RecentTransactions({ transactions, onViewAll }: RecentTransactionsProps) {
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
              className="text-[12px] text-accent font-medium"
            >
              Xem tất cả →
            </button>
          )}
        </div>

        {transactions.length === 0 ? (
          <div
            className="bg-white rounded-2xl py-8 flex flex-col items-center"
            style={{
              border: '1px solid #E8E6E0',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}
          >
            <p className="text-2xl mb-2">🧾</p>
            <p className="text-[13px] text-text-muted">Chưa có giao dịch nào</p>
          </div>
        ) : (
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{
              border: '1px solid #E8E6E0',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}
          >
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
}

import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import { Trash } from 'lucide-react'
import { useTransactionStore } from '@/stores/transactionStore'
import { triggerHaptic } from '@/lib/haptic'

function TransactionRow({
  tx,
  isLast,
  onSelect,
}: {
  tx: HomeData['recentTransactions'][0]
  isLast: boolean
  onSelect: (tx: Transaction) => void
}) {
  const catColor = tx.category?.color ?? 'var(--color-accent)'
  const { softDelete } = useTransactionStore()
  
  const x = useMotionValue(0)
  const deleteOpacity = useTransform(x, [0, -60], [0, 1])
  const deleteBg = useTransform(x, [0, -80], ['#FEE2E2', '#EF4444'])

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80) {
      triggerHaptic('heavy')
      softDelete(tx.id!)
    }
  }

  return (
    <div className="relative overflow-hidden w-full" style={{
      borderBottom: isLast ? 'none' : '0.5px solid #F0EDE8',
    }}>
      {/* Background delete layer */}
      <motion.div 
        style={{ opacity: deleteOpacity, backgroundColor: deleteBg }}
        className="absolute inset-y-0 right-0 flex w-full items-center justify-end pr-5"
      >
        <Trash className="text-white size-4" />
      </motion.div>

      {/* Foreground swipable layer */}
      <motion.button
        type="button"
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        // Active click detection is tricky with drag, use onClick standardly
        onClick={() => {
          if (x.get() > -10 && x.get() < 10) {
            onSelect(tx);
          }
        }}
        whileTap={{ scale: 0.98 }}
        className="relative z-10 w-full flex items-center gap-3 px-4 py-3 text-left bg-white active:bg-surface transition-colors cursor-grab active:cursor-grabbing"
      >
        {/* Category icon  */}
        <div
          className="shrink-0 flex items-center justify-center rounded-xl text-xl leading-none"
          style={{
            width: 40,
            height: 40,
            background: catColor + '18',
          }}
        >
          {tx.category?.icon ?? '📦'}
        </div>

        <div className="flex-1 min-w-0">
          <p className="truncate text-[13.5px] font-medium text-text">
            {tx.category?.name ?? 'Không rõ'}
          </p>
          <p className="font-num text-[11px] text-text-muted mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
            {getVietnameseDateLabel(tx.date)}
            {tx.note ? ` · ${tx.note}` : ''}
          </p>
        </div>

        <div className="shrink-0 flex items-baseline gap-0.5">
          <span className="text-text-muted text-[12px]">−</span>
          <span className="font-num text-[14px] font-semibold text-text">
            {formatVND(tx.amount)}đ
          </span>
        </div>
      </motion.button>
    </div>
  )
}
