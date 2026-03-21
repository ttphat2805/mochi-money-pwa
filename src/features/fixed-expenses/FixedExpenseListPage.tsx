import { useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { formatVND } from '@/lib/utils'
import { useFixedExpenses } from '@/hooks/useFixedExpenses'
import { FixedExpenseRow } from './FixedExpenseRow'
import { FixedExpenseFormSheet } from './FixedExpenseFormSheet'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import type { FixedExpense } from '@/types'

interface FixedExpenseListPageProps {
  onBack: () => void
}

export function FixedExpenseListPage({ onBack }: FixedExpenseListPageProps) {
  const {
    fixedExpenses,
    activeExpenses,
    totalPerMonth,
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
    toggleActive,
  } = useFixedExpenses()

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<FixedExpense | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<FixedExpense | null>(null)

  const handleEdit = (expense: FixedExpense) => {
    setEditTarget(expense)
    setFormOpen(true)
  }

  const handleAdd = () => {
    setEditTarget(undefined)
    setFormOpen(true)
  }

  const handleSave = async (data: Omit<FixedExpense, 'id'>, id?: number) => {
    if (id != null) {
      await updateFixedExpense(id, data)
    } else {
      await addFixedExpense(data)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return
    await deleteFixedExpense(deleteTarget.id, deleteTarget.name)
    setDeleteTarget(null)
  }

  // Sort: active first
  const sorted = [...fixedExpenses].sort((a, b) => {
    if (a.active === b.active) return (a.payDay ?? 0) - (b.payDay ?? 0)
    return a.active ? -1 : 1
  })

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 safe-top">
          <button
            type="button"
            onClick={onBack}
            className="bg-surface active:bg-surface2 flex size-8 items-center justify-center rounded-full transition-colors"
            aria-label="Quay lại"
          >
            <ArrowLeft className="size-4" />
          </button>
          <h1 className="flex-1 text-center text-base font-semibold">Chi phí cố định</h1>
          <button
            type="button"
            onClick={handleAdd}
            className="bg-surface active:bg-surface2 flex size-8 items-center justify-center rounded-full transition-colors"
            aria-label="Thêm chi phí"
          >
            <Plus className="size-4" />
          </button>
        </header>

        {/* Monthly total strip */}
        <div className="bg-surface px-4 py-3 flex items-center justify-between">
          <span className="text-text-muted text-[12px]">Tổng cố định tháng này</span>
          <span className="font-num text-accent text-[14px] font-semibold">
            {formatVND(totalPerMonth)}đ
          </span>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20">
              <p className="text-3xl">🏠</p>
              <p className="text-text-muted text-[13px]">Chưa có chi phí cố định</p>
              <p className="text-text-hint text-[11px]">Nhấn + để thêm</p>
            </div>
          ) : (
            <div className="mt-2 mx-4 rounded-xl overflow-hidden border border-border bg-white">
              {sorted.map((expense, idx) => (
                <div key={expense.id}>
                  {idx > 0 && <div className="border-border mx-4 border-t" />}
                  <FixedExpenseRow
                    expense={expense}
                    onEdit={() => handleEdit(expense)}
                    onToggleActive={(active) => expense.id != null && toggleActive(expense.id, active)}
                    onDelete={() => setDeleteTarget(expense)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Active count summary */}
          {fixedExpenses.length > 0 && (
            <p className="mt-3 text-center text-text-hint text-[11px] pb-6">
              {activeExpenses.length}/{fixedExpenses.length} khoản đang hoạt động
            </p>
          )}
        </div>
      </div>

      {/* Form sheet */}
      <FixedExpenseFormSheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        editExpense={editTarget}
      />

      {/* Delete confirm dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Xoá chi phí này?"
        description="Giao dịch đã tạo sẽ không bị ảnh hưởng."
        confirmLabel="Xoá"
      />
    </>
  )
}
