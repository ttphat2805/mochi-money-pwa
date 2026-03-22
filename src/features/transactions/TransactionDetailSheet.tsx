import { useState, useEffect } from 'react'
import { Trash2, Calendar } from 'lucide-react'
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
import { db } from '@/lib/db'
import { formatVND, getDateLabel } from '@/lib/utils'
import { PAYMENT_METHODS } from '@/lib/constants'
import type { Transaction, PaymentMethod } from '@/types'

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

  // Edit state
  const [amount, setAmount] = useState(0)
  const [amountDisplay, setAmountDisplay] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [date, setDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>(undefined)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)

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
  }, [transaction?.id, open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '')
    const num = parseInt(digits || '0', 10)
    setAmount(num)
    setAmountDisplay(num === 0 ? '' : formatVND(num))
  }

  const handleSave = async () => {
    if (!transaction?.id || amount === 0 || !categoryId) return
    setSaving(true)
    try {
      await db.transactions.update(transaction.id, {
        amount,
        categoryId,
        note: note.trim() || undefined,
        date,
        paymentMethod,
      })
      toast.success('Đã cập nhật giao dịch')
      onClose()
      onUpdated?.()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!transaction?.id) return
    const txId = transaction.id
    const txAmount = transaction.amount
    await db.transactions.update(txId, { deletedAt: new Date().toISOString() })
    setDeleteConfirmOpen(false)
    onClose()
    onDeleted?.()
    toast('Đã xoá giao dịch · ' + formatVND(txAmount) + 'đ', {
      action: {
        label: 'Hoàn tác',
        onClick: async () => {
          await db.transactions.update(txId, { deletedAt: null })
          toast.success('Đã khôi phục')
          onUpdated?.()
        },
      },
      duration: 5000,
    })
  }

  const handleClose = () => {
    onClose()
  }

  if (!transaction) return null

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
        <SheetContent
          onInteractOutside={(e) => {
            if (datePickerOpen || deleteConfirmOpen) {
              e.preventDefault()
            }
          }}
          side="bottom"
          showCloseButton={true}
          className="rounded-t-3xl bg-white p-0"
          style={{ maxHeight: '92dvh' }}
        >
          <SheetTitle className="sr-only">Chi tiết giao dịch</SheetTitle>
          <SheetDescription className="sr-only">Xem và chỉnh sửa giao dịch</SheetDescription>

          <div className="overflow-y-auto" style={{ maxHeight: '90dvh' }}>
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 rounded-full bg-surface2" />
            </div>

            <div className="px-5 pb-8 flex flex-col gap-4 pt-4">
              {/* Header Title replaced "Back to view" */}
              <div className="flex items-center justify-center -mt-2 mb-2">
                <h2 className="text-[15px] font-semibold text-text">Chỉnh sửa giao dịch</h2>
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
                  categories={categories}
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
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú (tùy chọn)"
                  className="w-full h-12 px-4 rounded-xl bg-surface border border-transparent text-[14px] outline-none focus:border-accent transition-colors"
                />
              </div>

              {/* Date */}
              <div>
                <label className="text-[10px] font-medium text-text-hint uppercase tracking-[1.2px] mb-1.5 block">
                  Ngày
                </label>
                <button
                  type="button"
                  onClick={() => setDatePickerOpen(true)}
                  className="w-full h-12 px-4 rounded-xl bg-surface border border-transparent text-[14px] text-left flex items-center gap-2 outline-none focus:border-accent transition-colors active:bg-surface2"
                >
                  <Calendar size={16} className="text-text-muted shrink-0" />
                  <span className="text-text flex-1">{getDateLabel(date)}</span>
                  <span className="text-text-hint text-[12px] font-mono">{date}</span>
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
                          background: selected ? '#FFF4E0' : '#F2F0EC',
                          borderColor: selected ? '#E8A020' : 'transparent',
                          color: selected ? '#B87B10' : '#88887A',
                        }}
                      >
                        {m.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Save */}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || amount === 0 || !categoryId}
                className="h-12 w-full rounded-xl bg-text text-white text-[15px] font-semibold disabled:opacity-40 transition-all active:scale-[0.98] mt-2"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                className="h-12 w-full rounded-xl bg-danger-bg text-danger text-[15px] font-medium transition-all active:scale-[0.98] mt-1 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Xoá giao dịch
              </button>
            </div>
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
    </>
  )
}
