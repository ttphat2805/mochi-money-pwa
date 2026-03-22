import { useState } from 'react'
import { Plus } from 'lucide-react'
import { formatVND } from '@/lib/utils'
import { TransactionDetailSheet } from '@/features/transactions/TransactionDetailSheet'
import type { BudgetCategory, Transaction } from '@/types'

interface TxWithCategory extends Transaction {
  category: BudgetCategory | undefined
}

interface DayDetailPanelProps {
  selectedDay: string | null
  transactions: TxWithCategory[]
  today: string
  onAddTransaction: () => void
}

const WEEKDAYS_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

function getDayLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const dow = date.getDay()
  return `${WEEKDAYS_SHORT[dow]}, ${day} tháng ${month}`
}

export function DayDetailPanel({
  selectedDay,
  transactions,
  today,
  onAddTransaction,
}: DayDetailPanelProps) {
  const isOpen = !!selectedDay
  const total = transactions.reduce((s, tx) => s + tx.amount, 0)
  const isPastOrToday = !!selectedDay && selectedDay <= today
  const [selectedTx, setSelectedTx] = useState<TxWithCategory | null>(null)

  return (
    <>
      {/* Slide-up container */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ maxHeight: isOpen ? '500px' : '0px', opacity: isOpen ? 1 : 0 }}
      >
        <div
          key={selectedDay ?? 'none'} // triggers remount animation on day change
          className="mx-4 mt-3 rounded-[14px] border border-border bg-white"
          style={{ animation: isOpen ? 'dayPanelSlideUp 200ms ease-out' : 'none' }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-[13px] font-semibold">
              {selectedDay ? getDayLabel(selectedDay) : ''}
            </span>
            {total > 0 && (
              <span className="font-num text-[13px] font-bold text-accent">
                −{formatVND(total)}đ
              </span>
            )}
          </div>

          {/* Transactions — scrollable if many */}
          <div
            className="max-h-[280px] overflow-y-auto"
            style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
          >
            {transactions.length === 0 ? (
              <div className="px-4 py-4">
                <p className="text-text-muted text-[13px]">Không có chi tiêu hôm này</p>
                {isPastOrToday && (
                  <button
                    type="button"
                    onClick={onAddTransaction}
                    className="bg-accent mt-3 flex h-9 items-center gap-2 rounded-full px-4 text-[13px] font-semibold text-white active:scale-95 transition-transform"
                  >
                    <Plus className="size-3.5" />
                    Thêm chi tiêu
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {transactions.map((tx) => (
                  <button
                    key={tx.id}
                    type="button"
                    onClick={() => setSelectedTx(tx)}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left active:bg-surface transition-colors"
                  >
                    {/* Emoji container — fixed size, never inherits parent font */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: '#F2F0EC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: 18, lineHeight: 1 }}>
                        {tx.category?.icon ?? '📦'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">
                        {tx.category?.name ?? 'Không rõ'}
                      </p>
                      {tx.note && (
                        <p className="text-text-muted text-[11px]">{tx.note}</p>
                      )}
                    </div>
                    <span className="font-num shrink-0 text-[13px] font-semibold">
                      −{formatVND(tx.amount)}đ
                    </span>
                  </button>
                ))}
                {isPastOrToday && (
                  <div className="px-4 py-3">
                    <button
                      type="button"
                      onClick={onAddTransaction}
                      className="text-accent flex items-center gap-1.5 text-[13px] font-medium"
                    >
                      <Plus className="size-3.5" />
                      Thêm chi tiêu
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <TransactionDetailSheet
        open={!!selectedTx}
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onUpdated={() => setSelectedTx(null)}
        onDeleted={() => setSelectedTx(null)}
      />

      <style>{`
        @keyframes dayPanelSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
