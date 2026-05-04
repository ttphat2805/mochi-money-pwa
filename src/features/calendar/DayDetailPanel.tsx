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

const WEEKDAYS_SHORT = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']

function getDayLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const dow = date.getDay()
  return `${WEEKDAYS_SHORT[dow]}, ngày ${day}`
}

export function DayDetailPanel({
  selectedDay,
  transactions,
  today,
  onAddTransaction,
}: DayDetailPanelProps) {
  const total = transactions.reduce((s, tx) => s + tx.amount, 0)
  const isPastOrToday = !!selectedDay && selectedDay <= today
  const [selectedTx, setSelectedTx] = useState<TxWithCategory | null>(null)

  if (!selectedDay) return null

  return (
    <>
      <div className="px-4 mt-2">
        <div className="bg-white rounded-[28px] border border-border/60 shadow-premium overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-surface/30">
            <div>
              <p className="text-[10px] font-black text-text-hint uppercase tracking-widest mb-0.5">Chi tiết ngày</p>
              <h3 className="text-[15px] font-black text-text leading-tight">{getDayLabel(selectedDay)}</h3>
            </div>
            {total > 0 && (
              <div className="text-right">
                <p className="text-[10px] font-black text-text-hint uppercase tracking-widest mb-0.5">Tổng cộng</p>
                <p className="font-num text-[16px] font-black text-accent leading-tight">−{formatVND(total)}đ</p>
              </div>
            )}
          </div>

          {/* Transaction list */}
          <div className="max-h-[320px] overflow-y-auto scrollbar-hide">
            {transactions.length === 0 ? (
              <div className="px-6 py-8 text-center flex flex-col items-center gap-3">
                <div className="size-12 rounded-full bg-surface flex items-center justify-center text-xl">☕️</div>
                <p className="text-text-muted text-[13px] font-medium italic opacity-80">
                  Không có chi tiêu cho ngày này
                </p>
                {isPastOrToday && (
                  <button
                    type="button"
                    onClick={onAddTransaction}
                    className="mt-1 h-9 px-4 rounded-full bg-accent text-white text-[12px] font-bold shadow-sm active:scale-95 transition-transform"
                  >
                    Thêm ngay
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col">
                {transactions.map((tx) => (
                  <button
                    key={tx.id}
                    type="button"
                    onClick={() => setSelectedTx(tx)}
                    className="flex items-center gap-4 px-5 py-4 w-full text-left active:bg-surface/50 transition-colors border-b border-border/40 last:border-0"
                  >
                    <div
                      className="shrink-0 flex items-center justify-center rounded-[14px] text-[18px] leading-none"
                      style={{
                        width: 42,
                        height: 42,
                        background: (tx.category?.color ?? '#88887A') + '15',
                      }}
                    >
                      {tx.category?.icon ?? '📦'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[14px] font-bold text-text leading-tight mb-0.5">
                        {tx.category?.name ?? 'Không rõ'}
                      </p>
                      {tx.note && (
                        <p className="text-text-hint text-[11px] truncate">{tx.note}</p>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                       <p className="font-num text-[14px] font-black text-text leading-none mb-0.5">
                         −{formatVND(tx.amount)}đ
                       </p>
                       <p className="text-[10px] text-text-hint font-medium uppercase">đã ghi</p>
                    </div>
                  </button>
                ))}
                
                {isPastOrToday && (
                  <button
                    type="button"
                    onClick={onAddTransaction}
                    className="flex items-center justify-center gap-2 py-4 w-full text-accent text-[13px] font-bold active:bg-surface/50 transition-colors"
                  >
                    <Plus size={14} strokeWidth={3} />
                    <span>Thêm chi tiêu khác</span>
                  </button>
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
    </>
  )
}
