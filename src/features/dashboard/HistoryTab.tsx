import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { formatVND, getDateLabel } from '@/lib/utils'
import { useHistory, type TransactionWithCategory } from '@/hooks/useHistory'
import { TransactionDetailSheet } from '@/features/transactions/TransactionDetailSheet'
import type { Transaction } from '@/types'

// ── Transaction row ────────────────────────────────────────────

function TxRow({
  tx,
  onSelect,
}: {
  tx: TransactionWithCategory
  onSelect: (tx: Transaction) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(tx)}
      className="flex min-h-[52px] items-center gap-3 rounded-xl px-3 py-2.5 active:bg-surface transition-colors text-left w-full"
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          background: tx.category?.color ? tx.category.color + '18' : '#F2F0EC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: `1.5px solid ${tx.category?.color ?? '#E2E0D8'}22`,
        }}
      >
        <span style={{ fontSize: 20, lineHeight: 1 }}>{tx.category?.icon ?? '📦'}</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-medium text-text">
          {tx.category?.name ?? 'Không rõ'}
        </p>
        <p className="font-num text-[11px] text-text-muted mt-0.5">
          {getDateLabel(tx.date)}
          {tx.note ? ` · ${tx.note}` : ''}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <span className="text-text-muted text-[12px]">−</span>
        <span className="font-num text-[14px] font-semibold text-text">
          {formatVND(tx.amount)}đ
        </span>
      </div>
    </button>
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

        {/* Category filter chips */}
        {history.activeCategories.length > 0 && (
          <div
            className="flex gap-2 overflow-x-auto px-4 pb-3"
            style={{ scrollbarWidth: 'none' }}
          >
            {/* All chip */}
            <button
              id="history-filter-all"
              type="button"
              onClick={() => history.setSelectedCategoryId(null)}
              className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium transition-colors"
              style={{
                background: !history.selectedCategoryId ? '#1A1A18' : '#F2F0EC',
                color: !history.selectedCategoryId ? '#fff' : '#88887A',
              }}
            >
              Tất cả
            </button>

            {history.activeCategories.map((cat) => {
              const isActive = history.selectedCategoryId === cat.id
              return (
                <button
                  key={cat.id}
                  id={`history-filter-cat-${cat.id}`}
                  type="button"
                  onClick={() => history.setSelectedCategoryId(isActive ? null : cat.id!)}
                  className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium transition-colors"
                  style={{
                    background: isActive ? cat.color + '20' : '#F2F0EC',
                    color: isActive ? cat.color : '#88887A',
                    border: isActive ? `1.5px solid ${cat.color}` : '1.5px solid transparent',
                  }}
                >
                  <span style={{ fontSize: 13 }}>{cat.icon}</span>
                  {cat.name}
                </button>
              )
            })}
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
