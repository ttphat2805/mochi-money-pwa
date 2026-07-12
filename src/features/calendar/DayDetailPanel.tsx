import { useState } from 'react'
import { Plus, ChevronRight, CalendarPlus, Coffee } from 'lucide-react'
import { formatVND, sumSpent, tint } from '@/lib/utils'
import { NoteBadge } from '@/components/NoteBadge'
import { TransactionDetailSheet } from '@/features/transactions/TransactionDetailSheet'
import type { BudgetCategory, Transaction } from '@/types'
import { motion } from 'framer-motion'
import { usePersonalization } from '@/hooks/usePersonalization'
import { CategoryIcon } from '@/lib/categoryIcons'

interface TxWithCategory extends Transaction {
  category: BudgetCategory | undefined
}

interface DayDetailPanelProps {
  selectedDay: string
  transactions: TxWithCategory[]
  today: string
  onAddTransaction: () => void
}

const WEEKDAYS = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

function getDayLabel(dateStr: string, today: string): { title: string; sub: string } {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const dow = date.getDay()
  const isToday = dateStr === today
  const isTomorrow = (() => {
    const d = new Date(today)
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10) === dateStr
  })()
  const isYesterday = (() => {
    const d = new Date(today)
    d.setDate(d.getDate() - 1)
    return d.toISOString().slice(0, 10) === dateStr
  })()

  const dayName = isToday
    ? 'Hôm nay'
    : isYesterday
    ? 'Hôm qua'
    : isTomorrow
    ? 'Ngày mai'
    : WEEKDAYS[dow]

  return {
    title: dayName,
    sub: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`,
  }
}

export function DayDetailPanel({
  selectedDay,
  transactions,
  today,
  onAddTransaction,
}: DayDetailPanelProps) {
  const { settings } = usePersonalization()
  const accent = settings.accentColor
  const total = sumSpent(transactions)
  const isFuture = selectedDay > today
  const [selectedTx, setSelectedTx] = useState<TxWithCategory | null>(null)
  const { title, sub } = getDayLabel(selectedDay, today)

  return (
    <>
      <div
        className="rounded-[24px] overflow-hidden border border-border/60 bg-card"
        style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.25)' }}
      >
        {/* ── Header ── */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{
            background: `linear-gradient(135deg, ${tint(accent, 7)} 0%, ${tint(accent, 2)} 100%)`,
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-text-hint mb-0.5">{sub}</p>
            <h3 className="text-[18px] font-black text-text leading-tight">{title}</h3>
          </div>

          <div className="flex items-center gap-2">
            {total > 0 && (
              <div className="text-right">
                <p className="text-[10px] font-bold text-text-hint uppercase tracking-wide mb-0.5">Tổng</p>
                <p
                  className="font-num text-[17px] font-black leading-tight"
                  style={{ color: accent }}
                >
                  −{formatVND(total)}đ
                </p>
              </div>
            )}
            <motion.button
              type="button"
              whileTap={{ scale: 0.88 }}
              onClick={onAddTransaction}
              className="size-10 rounded-full flex items-center justify-center shadow-sm text-white"
              style={{ background: accent }}
            >
              <Plus size={18} strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="bg-card">
          {transactions.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-9 px-5 text-center gap-3">
              {isFuture ? (
                <div
                  className="size-14 rounded-2xl flex items-center justify-center mb-1"
                  style={{ background: tint(accent, 8) }}
                >
                  <CalendarPlus size={26} style={{ color: accent }} strokeWidth={1.5} />
                </div>
              ) : (
                <div className="size-14 rounded-2xl flex items-center justify-center mb-1 bg-amber-400/10">
                  <Coffee size={26} className="text-amber-400" strokeWidth={1.5} />
                </div>
              )}
              <p className="text-text-muted text-[13px] font-medium leading-snug">
                {isFuture
                  ? 'Chưa có giao dịch — lên kế hoạch trước nhé!'
                  : 'Không có chi tiêu ngày này'}
              </p>
            </div>
          ) : (
            /* Transaction list */
            <div>
              {transactions.map((tx, idx) => {
                const timeLabel = tx.createdAt
                  ? new Date(tx.createdAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })
                  : ''
                const catColor = tx.category?.color ?? 'var(--color-text-muted)'

                return (
                  <motion.button
                    key={tx.id}
                    type="button"
                    whileTap={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                    onClick={() => setSelectedTx(tx)}
                    className="flex items-center gap-3.5 px-5 py-3.5 w-full text-left transition-colors"
                    style={{
                      borderBottom: idx < transactions.length - 1 ? '1px solid var(--color-border)' : 'none',
                    }}
                  >
                    {/* Category icon */}
                    <div
                      className="shrink-0 flex items-center justify-center rounded-[14px] leading-none"
                      style={{
                        width: 42,
                        height: 42,
                        background: tint(catColor, 9),
                      }}
                    >
                      <CategoryIcon icon={tx.category?.icon} size={20} color={tx.category?.color} className="text-text-muted" />
                    </div>

                    {/* Name + note/time */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="truncate text-[14px] font-bold text-text leading-tight">
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

                    {/* Amount + chevron */}
                    <div className="shrink-0 flex items-center gap-1">
                      <p
                        className="font-num text-[14px] font-bold leading-none"
                        style={{ color: tx.isNote ? 'var(--color-text-muted)' : 'var(--color-text)' }}
                      >
                        −{formatVND(tx.amount)}đ
                      </p>
                      <ChevronRight size={13} className="text-text-hint/50" />
                    </div>
                  </motion.button>
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
