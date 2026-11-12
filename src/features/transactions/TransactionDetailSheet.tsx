import { useState, useEffect } from 'react'
import { Trash2, Calendar, BookOpen, XIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { CategoryGrid } from '@/features/quick-add/CategoryGrid'
import { DatePickerSheet } from '@/features/quick-add/DatePickerSheet'
import { useKeyboardInset } from '@/hooks/useKeyboardInset'
import { db } from '@/lib/db'
import { closeButtonClass, cn, formatVND, getDateLabel, getDateNDaysAgo, getTodayString } from '@/lib/utils'
import { triggerHaptic } from '@/lib/haptic'
import { PAYMENT_METHODS } from '@/lib/constants'
import type { Transaction, PaymentMethod } from '@/types'
import { softDeleteWithUndo } from './softDeleteWithUndo'

// ── Props ─────────────────────────────────────────────────────

interface TransactionDetailSheetProps {
  open: boolean
  transaction: Transaction | null
  onClose: () => void
  onUpdated?: () => void
  onDeleted?: () => void
}

// ── Main component ────────────────────────────────────────────

export function TransactionDetailSheet({
  open,
  transaction,
  onClose,
  onUpdated,
  onDeleted,
}: TransactionDetailSheetProps) {

  // Keep rendering the last transaction while the sheet animates closed —
  // parents clear `transaction` and `open` together. (State adjusted during
  // render, per React docs, rather than synced in an effect.)
  const [lastTx, setLastTx] = useState<Transaction | null>(transaction)
  if (transaction && transaction !== lastTx) setLastTx(transaction)
  const tx = transaction ?? lastTx

  // Edit state
  const [amount, setAmount] = useState(0)
  const [amountDisplay, setAmountDisplay] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [date, setDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>(undefined)
  const [isNote, setIsNote] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false)
  const [initialCategoryId, setInitialCategoryId] = useState<number | null>(null)
  const { inset: keyboardInset, viewportHeight } = useKeyboardInset(open)

  // Capture the starting category when the sheet opens to prevent list jumping during selection
  useEffect(() => {
    if (open && transaction && initialCategoryId === null) {
      setInitialCategoryId(transaction.categoryId)
    } else if (!open) {
      setInitialCategoryId(null)
    }
  }, [open, transaction, initialCategoryId])

  const categories = useLiveQuery(() => db.categories.orderBy('sortOrder').toArray()) ?? []

  // Reset when transaction changes / sheet opens
  useEffect(() => {
    if (!transaction) return
    setAmount(transaction.amount)
    setAmountDisplay(formatVND(transaction.amount))
    setCategoryId(transaction.categoryId)
    setNote(transaction.note ?? '')
    setDate(transaction.date)
    setPaymentMethod(transaction.paymentMethod)
    setIsNote(transaction.isNote ?? false)
  }, [transaction, open])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '')
    const num = parseInt(digits || '0', 10)
    setAmount(num)
    setAmountDisplay(num === 0 ? '' : formatVND(num))
  }

  // Only enable Save when something actually changed
  const isDirty =
    !!tx &&
    (amount !== tx.amount ||
      categoryId !== tx.categoryId ||
      note.trim() !== (tx.note ?? '') ||
      date !== tx.date ||
      paymentMethod !== tx.paymentMethod ||
      isNote !== (tx.isNote ?? false))
  // While there are unsaved edits, block drag/outside/Escape dismissal and
  // ask before discarding instead
  const guardDismiss = open && isDirty && !saving
  const canSave = isDirty && amount > 0 && !!categoryId && !saving

  const today = getTodayString()
  const yesterday = getDateNDaysAgo(1)
  const quickDates = [
    { value: today, label: 'Hôm nay' },
    { value: yesterday, label: 'Hôm qua' },
  ]
  const isQuickDate = date === today || date === yesterday

  const handleSave = async () => {
    if (!tx?.id || !canSave) return
    setSaving(true)
    try {
      await db.transactions.update(tx.id, {
        amount,
        categoryId,
        note: note.trim() || undefined,
        date,
        paymentMethod,
        isNote: isNote || undefined,
      })
      toast.success('Đã cập nhật giao dịch')
      onClose()
      onUpdated?.()
    } catch (err) {
      console.error('TransactionDetailSheet: save failed', err)
      toast.error('Không thể lưu thay đổi. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!tx?.id) return
    const ok = await softDeleteWithUndo({ id: tx.id, amount: tx.amount }, onUpdated)
    setDeleteConfirmOpen(false)
    if (!ok) return
    onClose()
    onDeleted?.()
  }

  const handleClose = () => {
    if (guardDismiss) {
      setDiscardConfirmOpen(true)
      return
    }
    onClose()
  }

  const handleDiscard = () => {
    setDiscardConfirmOpen(false)
    onClose()
  }

  const nestedOpen = datePickerOpen || deleteConfirmOpen || discardConfirmOpen

  if (!tx) return null

  return (
    <>
      {/* repositionInputs off: vaul's keyboard handling leaves the drawer
          shrunk on iOS (see useKeyboardInset) */}
      <Sheet
        open={open}
        onOpenChange={(v) => !v && handleClose()}
        repositionInputs={false}
        // Not dismissible while dirty: vaul ignores close requests and drag,
        // so the drawer can't animate away before the user confirms
        dismissible={!guardDismiss}
      >
        <SheetContent
          onPointerDownOutside={(e) => {
            if (nestedOpen) e.preventDefault()
            else if (guardDismiss) setDiscardConfirmOpen(true)
          }}
          onInteractOutside={(e) => {
            if (nestedOpen) e.preventDefault()
          }}
          onFocusOutside={(e) => {
            if (nestedOpen) e.preventDefault()
          }}
          onEscapeKeyDown={() => {
            if (guardDismiss && !nestedOpen) setDiscardConfirmOpen(true)
          }}
          side="bottom"
          showCloseButton={!guardDismiss}
          className="rounded-t-3xl bg-card p-0"
          style={
            keyboardInset > 0
              ? // Keyboard open: sit right above it so the Save bar stays reachable
                { bottom: keyboardInset, maxHeight: viewportHeight - 12 }
              : { maxHeight: '92dvh' }
          }
        >
          <SheetTitle className="sr-only">Chi tiết giao dịch</SheetTitle>
          <SheetDescription className="sr-only">Xem và chỉnh sửa giao dịch</SheetDescription>

          {/* Dirty: Drawer.Close would be ignored (not dismissible), so use
              our own X that asks before discarding */}
          {guardDismiss && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light')
                setDiscardConfirmOpen(true)
              }}
              className={cn(closeButtonClass, 'absolute top-4 right-4 size-8 z-50')}
              aria-label="Đóng"
            >
              <XIcon size={14} strokeWidth={2.5} />
            </button>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="px-5 pb-4 flex flex-col gap-4 pt-4">
              {/* Header */}
              <div className="flex items-center justify-center -mt-2 mb-2 gap-2">
                <h2 className="text-[15px] font-semibold text-text">Chỉnh sửa giao dịch</h2>
                {isNote && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-full border border-sky-400/20">
                    <BookOpen size={10} />
                    Ghi chú
                  </span>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="text-[10px] font-medium text-text-hint uppercase tracking-[1.2px] mb-1.5 block">
                  Số tiền
                </label>
                <div className="flex items-center gap-2 bg-surface rounded-xl px-4 h-14 border border-transparent focus-within:border-accent transition-colors">
                  <span className="text-text-muted text-[14px]">−</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    enterKeyHint="done"
                    value={amountDisplay}
                    onChange={handleAmountChange}
                    className="flex-1 bg-transparent text-[20px] font-mono font-semibold outline-none text-text placeholder:text-text-hint"
                    placeholder="0"
                  />
                  <span className="text-text-muted text-[14px]">đ</span>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-[10px] font-medium text-text-hint uppercase tracking-[1.2px] mb-1.5 block">
                  Danh mục
                </label>
                <CategoryGrid
                  categories={[...categories].sort((a, b) => {
                    if (a.id === initialCategoryId) return -1;
                    if (b.id === initialCategoryId) return 1;
                    return 0;
                  })}
                  selectedId={categoryId}
                  onSelect={setCategoryId}
                />
              </div>

              {/* Note */}
              <div>
                <label className="text-[10px] font-medium text-text-hint uppercase tracking-[1.2px] mb-1.5 block">
                  Ghi chú
                </label>
                <input
                  type="text"
                  enterKeyHint="done"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onFocus={(e) => {
                    // Scroll the field into view after keyboard opens (~300ms delay)
                    const el = e.currentTarget
                    setTimeout(() => {
                      const element = el as HTMLElement & { scrollIntoViewIfNeeded?: (alignCenter: boolean) => void }
                      if (element.scrollIntoViewIfNeeded) {
                        element.scrollIntoViewIfNeeded(true)
                      } else {
                        el.scrollIntoView({ block: 'center', behavior: 'smooth' })
                      }
                    }, 320)
                  }}
                  placeholder="Ghi chú (tùy chọn)"
                  className="w-full h-12 px-4 rounded-xl bg-surface border border-transparent text-[14px] outline-none focus:border-accent transition-colors"
                />
              </div>

              {/* Date */}
              <div>
                <label className="text-[10px] font-medium text-text-hint uppercase tracking-[1.2px] mb-1.5 block">
                  Ngày
                </label>
                <div className="flex gap-2">
                  {quickDates.map((d) => {
                    const selected = date === d.value
                    return (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => setDate(d.value)}
                        aria-pressed={selected}
                        className={`h-12 px-4 shrink-0 rounded-xl border text-[13px] font-medium transition-colors ${
                          selected
                            ? 'bg-accent-bg border-accent text-accent-dark'
                            : 'bg-surface border-transparent text-text-muted active:bg-surface2'
                        }`}
                      >
                        {d.label}
                      </button>
                    )
                  })}
                  <button
                    type="button"
                    onClick={() => setDatePickerOpen(true)}
                    className={`flex-1 min-w-0 h-12 px-4 rounded-xl border text-[13px] flex items-center gap-2 transition-colors ${
                      isQuickDate
                        ? 'bg-surface border-transparent text-text-muted active:bg-surface2'
                        : 'bg-accent-bg border-accent text-accent-dark font-medium'
                    }`}
                  >
                    <Calendar size={15} className="shrink-0" />
                    <span className="truncate">
                      {isQuickDate ? 'Ngày khác' : `${getDateLabel(date)}/${date.slice(0, 4)}`}
                    </span>
                  </button>
                </div>
              </div>

              {/* isNote toggle */}
              <div>
                <label className="text-[10px] font-medium text-text-hint uppercase tracking-[1.2px] mb-1.5 block">
                  Loại giao dịch
                </label>
                <button
                  type="button"
                  onClick={() => setIsNote((v) => !v)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                    isNote ? 'bg-sky-400/10 border-sky-400/25' : 'bg-surface border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen size={15} className={isNote ? 'text-sky-400' : 'text-text-muted'} />
                    <span className={`text-[13px] font-medium ${
                      isNote ? 'text-sky-400' : 'text-text-muted'
                    }`}>
                      {isNote ? 'Ghi chú — không tính vào chi tiêu' : 'Chi tiêu bình thường'}
                    </span>
                  </div>
                  <div className={`w-9 h-5 rounded-full relative transition-colors ${
                    isNote ? 'bg-sky-500' : 'bg-white/15'
                  }`}>
                    <div className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform ${
                      isNote ? 'translate-x-4' : 'translate-x-0.5'
                    }`} />
                  </div>
                </button>
              </div>

              {/* Payment method chips */}
              <div>
                <label className="text-[10px] font-medium text-text-hint uppercase tracking-[1.2px] mb-1.5 block">
                  Phương thức (tùy chọn)
                </label>
                <div className="flex gap-2 flex-wrap">
                  {PAYMENT_METHODS.map((m) => {
                    const selected = paymentMethod === m.value
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setPaymentMethod(selected ? undefined : m.value as PaymentMethod)}
                        className="h-9 px-4 rounded-full text-[12px] font-medium border transition-colors"
                        style={{
                          background: selected ? 'var(--color-accent-bg)' : 'var(--color-surface2)',
                          borderColor: selected ? 'var(--color-accent)' : 'transparent',
                          color: selected ? 'var(--color-accent-dark)' : 'var(--color-text-muted)',
                        }}
                      >
                        {m.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Actions — pinned below the scroll area so Save is always one tap away */}
          <div
            className={`shrink-0 grid grid-cols-12 gap-3 px-5 pt-3 border-t border-border bg-card ${
              keyboardInset > 0 ? 'pb-3' : 'pb-[calc(12px+env(safe-area-inset-bottom))]'
            }`}
          >
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              className="col-span-4 h-12 rounded-xl bg-danger-bg text-danger transition-all active:scale-[0.92] flex items-center justify-center gap-2 shadow-sm shadow-danger/5 text-[14px] font-medium"
            >
              <Trash2 size={16} />
              <span>Xoá</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="col-span-8 h-12 rounded-xl bg-accent text-white text-[15px] font-semibold disabled:opacity-40 transition-all active:scale-[0.98] shadow-lg shadow-black/20 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Đang lưu…</span>
                </>
              ) : (
                <span>{isDirty ? 'Lưu lại' : 'Chưa có thay đổi'}</span>
              )}
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Date picker — separate overlay, avoids Radix nesting issue */}
      <DatePickerSheet
        open={datePickerOpen}
        onClose={() => setDatePickerOpen(false)}
        onConfirm={(d) => {
          setDate(d)
          // Delay closing to prevent Radix from interpreting the late click as an outside interaction
          setTimeout(() => setDatePickerOpen(false), 50)
        }}
        initialDate={date}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        variant="delete"
        title="Xoá giao dịch này?"
        description="Thao tác này không thể hoàn tác sau 5 giây."
        confirmLabel="Xoá"
      />

      {/* Discard unsaved edits confirm */}
      <ConfirmDialog
        open={discardConfirmOpen}
        onClose={() => setDiscardConfirmOpen(false)}
        onConfirm={handleDiscard}
        variant="warning"
        title="Bỏ thay đổi chưa lưu?"
        description="Các chỉnh sửa của bạn sẽ không được lưu."
        confirmLabel="Bỏ thay đổi"
        cancelLabel="Tiếp tục sửa"
      />
    </>
  )
}
