import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
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

  if (transactions.length === 0) {
    return (
      <div className="px-5">
        <div className="px-0 pb-1.5">
          <span className="text-text-hint text-[10px] font-medium uppercase tracking-[1.2px]">
            Gần đây
          </span>
        </div>
        <p className="text-text-muted text-[13px]">Chưa có giao dịch nào</p>
      </div>
    )
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between px-5 pb-1.5">
          <span className="text-text-hint text-[10px] font-medium uppercase tracking-[1.2px]">
            Gần đây
          </span>
          <button
            type="button"
            onClick={onViewAll}
            className="text-accent text-[12px] font-medium"
          >
            Xem tất cả →
          </button>
        </div>

        <div className="mx-2 flex flex-col">
          {transactions.map((tx) => (
            <button
              key={tx.id}
              type="button"
              onClick={() => setSelectedTx(tx)}
              className="flex min-h-[48px] items-center gap-3 rounded-xl px-3 py-2.5 active:bg-surface transition-colors text-left w-full"
            >
              {/* Category icon */}
              <span className="text-xl leading-none">{tx.category?.icon ?? '📦'}</span>

              {/* Name + date */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">
                  {tx.category?.name ?? 'Không rõ'}
                </p>
                <p className="font-num text-[11px] text-text-muted">
                  {getVietnameseDateLabel(tx.date)}
                  {tx.note ? ` · ${tx.note}` : ''}
                </p>
              </div>

              {/* Amount */}
              <div className="flex shrink-0 items-center gap-0.5">
                <span className="text-text-muted text-[12px]">−</span>
                <span className="font-num text-[14px] font-semibold">
                  {formatVND(tx.amount)}đ
                </span>
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="mt-1 flex w-full items-center justify-center gap-1 py-3 text-[13px] font-medium text-text-muted active:text-text"
        >
          Xem lịch sử đầy đủ
          <ChevronRight className="size-4" />
        </button>
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
