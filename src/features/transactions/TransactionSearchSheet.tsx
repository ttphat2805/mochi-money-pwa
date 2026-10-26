import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Search, SearchX, X } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { CloseButton } from '@/components/CloseButton'
import { CategoryIcon } from '@/components/CategoryIcon'
import { NoteBadge } from '@/components/NoteBadge'
import { db } from '@/lib/db'
import { formatVND, getVietnameseDateLabel, sumSpent, tint } from '@/lib/utils'
import type { BudgetCategory, Transaction } from '@/types'
import { TransactionDetailSheet } from './TransactionDetailSheet'
import { buildMatcher } from './searchTransactions'

const MAX_RESULTS = 100
const DEBOUNCE_MS = 150

type Result = Transaction & { category: BudgetCategory | undefined }

interface TransactionSearchSheetProps {
  open: boolean
  onClose: () => void
}

export function TransactionSearchSheet({ open, onClose }: TransactionSearchSheetProps) {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [query])

  // Only query the DB while the sheet is open
  const transactions = useLiveQuery(
    () => (open ? db.transactions.filter((tx) => !tx.deletedAt).toArray() : []),
    [open],
  )
  const categories = useLiveQuery(() => (open ? db.categories.toArray() : []), [open])

  const results = useMemo<Result[]>(() => {
    const matcher = buildMatcher(debounced)
    if (!matcher || !transactions) return []
    const catMap = new Map((categories ?? []).map((c) => [c.id, c]))

    const matched: Result[] = []
    for (const tx of transactions) {
      const category = catMap.get(tx.categoryId)
      if (matcher({ amount: tx.amount, note: tx.note, categoryName: category?.name })) {
        matched.push({ ...tx, category })
      }
    }
    matched.sort((a, b) => b.date.localeCompare(a.date) || (b.id ?? 0) - (a.id ?? 0))
    return matched.slice(0, MAX_RESULTS)
  }, [debounced, transactions, categories])

  const groups = useMemo(() => {
    const map = new Map<string, Result[]>()
    for (const tx of results) {
      const arr = map.get(tx.date) ?? []
      arr.push(tx)
      map.set(tx.date, arr)
    }
    return [...map.entries()].map(([date, items]) => ({ date, items }))
  }, [results])

  const handleOpenChange = (next: boolean) => {
    if (!next && !selectedTx) handleClose()
  }

  const handleClose = () => {
    setQuery('')
    setDebounced('')
    onClose()
  }

  const hasQuery = debounced.trim().length > 0

  return (
    <>
      {/* repositionInputs off: vaul's keyboard handling leaves the drawer
          shrunk on iOS (see useKeyboardInset) */}
      <Sheet open={open} onOpenChange={handleOpenChange} repositionInputs={false}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="bg-surface rounded-t-[32px] p-0 border-none"
          style={{ height: '92dvh' }}
        >
          <div className="flex flex-col h-full min-h-0">
            {/* ── Header + input ── */}
            <div className="px-5 pt-3 pb-3 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <SheetTitle className="text-[20px] font-black text-text tracking-tight">
                  Tìm giao dịch
                </SheetTitle>
                <CloseButton onClick={handleClose} size="sm" />
              </div>

              <div className="glass rounded-2xl flex items-center gap-2 px-3 h-12">
                <Search size={16} className="text-text-hint shrink-0" />
                <input
                  type="search"
                  inputMode="search"
                  enterKeyHint="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ghi chú, danh mục, số tiền..."
                  className="flex-1 min-w-0 bg-transparent text-text outline-none placeholder:text-text-hint"
                  aria-label="Tìm giao dịch"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="!min-h-0 size-6 rounded-full bg-white/10 flex items-center justify-center shrink-0"
                    aria-label="Xóa tìm kiếm"
                  >
                    <X size={12} className="text-text-muted" />
                  </button>
                )}
              </div>

              {hasQuery && results.length > 0 && (
                <p className="mt-3 text-[12px] font-semibold text-text-muted">
                  {results.length}
                  {results.length === MAX_RESULTS ? '+' : ''} kết quả · tổng{' '}
                  <span className="font-num text-text">−{formatVND(sumSpent(results))}đ</span>
                </p>
              )}
            </div>

            {/* ── Results ── */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
              {!hasQuery ? (
                <div className="flex flex-col items-center text-center pt-16 px-6 gap-3">
                  <div className="size-14 rounded-[20px] glass flex items-center justify-center">
                    <Search size={22} className="text-accent-dark" />
                  </div>
                  <p className="text-[13px] text-text-muted leading-relaxed">
                    Tìm theo ghi chú, danh mục hoặc số tiền (vd: 45k, 1tr5)
                  </p>
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center text-center pt-16 gap-3">
                  <div className="size-14 rounded-[20px] glass flex items-center justify-center">
                    <SearchX size={22} className="text-text-hint" />
                  </div>
                  <p className="text-[13px] text-text-muted">Không tìm thấy giao dịch</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {groups.map((group) => (
                    <div key={group.date}>
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-[12px] font-bold text-text-muted">
                          {getVietnameseDateLabel(group.date)}
                        </span>
                        <span className="font-num text-[11px] text-text-hint font-medium">
                          −{formatVND(sumSpent(group.items))}đ
                        </span>
                      </div>
                      <div className="bg-card rounded-[24px] overflow-hidden border border-white/8">
                        {group.items.map((tx, i) => (
                          <ResultRow
                            key={tx.id}
                            tx={tx}
                            isLast={i === group.items.length - 1}
                            onSelect={setSelectedTx}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

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

const ResultRow = React.memo(
  ({ tx, isLast, onSelect }: { tx: Result; isLast: boolean; onSelect: (tx: Transaction) => void }) => {
    const catColor = tx.category?.color ?? 'var(--color-accent)'
    const [, month, day] = tx.date.split('-')

    return (
      <button
        type="button"
        onClick={() => onSelect(tx)}
        className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left active:bg-white/5 transition-colors"
        style={{ borderBottom: isLast ? 'none' : '0.5px solid var(--color-border)' }}
      >
        <div
          className="shrink-0 flex items-center justify-center rounded-[14px]"
          style={{
            width: 42,
            height: 42,
            background: tint(catColor, 16),
            boxShadow: `inset 0 0 0 1px ${tint(catColor, 22)}`,
          }}
        >
          <CategoryIcon icon={tx.category?.icon} size={19} color={tx.category?.color} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="truncate text-[14px] font-semibold text-text leading-snug">
              {tx.category?.name ?? 'Không rõ'}
            </p>
            {tx.isNote && <NoteBadge />}
          </div>
          <p className="text-text-hint text-[11px] truncate">
            {tx.note ? `${tx.note} · ${day}/${month}` : `${day}/${month}`}
          </p>
        </div>

        <div className="shrink-0 flex items-baseline gap-0.5">
          {!tx.isNote && <span className="text-text-hint text-[12px] font-medium">−</span>}
          <span
            className={`font-num text-[15px] font-bold tracking-tight ${
              tx.isNote ? 'text-text-muted' : 'text-text'
            }`}
          >
            {formatVND(tx.amount)}đ
          </span>
        </div>
      </button>
    )
  },
)
