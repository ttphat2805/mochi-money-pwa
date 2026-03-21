import { useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/db'
import { useRecurring } from '@/hooks/useRecurring'
import { useCategoryStore } from '@/stores/categoryStore'
import { TemplateRow } from './TemplateRow'
import { RecurringFormSheet } from './RecurringFormSheet'
import type { RecurringTemplate } from '@/types'

interface RecurringListPageProps {
  onBack: () => void
}

export function RecurringListPage({ onBack }: RecurringListPageProps) {
  const { categories } = useCategoryStore()
  const { addTemplate, updateTemplate, deleteTemplate, toggleActive } = useRecurring()
  const templates = useLiveQuery(() => db.recurringTemplates.toArray(), []) ?? []

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<RecurringTemplate | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<RecurringTemplate | null>(null)

  const catMap = new Map(categories.map((c) => [c.id, c]))

  const handleEdit = (template: RecurringTemplate) => {
    setEditTarget(template)
    setFormOpen(true)
  }

  const handleAdd = () => {
    setEditTarget(undefined)
    setFormOpen(true)
  }

  const handleSave = async (data: Omit<RecurringTemplate, 'id'>, id?: number) => {
    if (id != null) {
      await updateTemplate(id, data, data.name)
    } else {
      await addTemplate(data)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return
    await deleteTemplate(deleteTarget.id, deleteTarget.name)
    setDeleteTarget(null)
  }

  return (
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
        <h1 className="flex-1 text-center text-base font-semibold">Khoản lặp lại</h1>
        <button
          type="button"
          onClick={handleAdd}
          className="bg-text active:opacity-80 flex size-8 items-center justify-center rounded-full text-white transition-opacity"
          aria-label="Thêm khoản"
        >
          <Plus className="size-4" />
        </button>
      </header>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <p className="text-[15px] font-medium">Chưa có khoản lặp lại nào</p>
            <p className="text-text-muted text-[13px]">Nhấn + để thêm</p>
          </div>
        ) : (
          <div className="bg-white mx-4 mt-2 overflow-hidden rounded-xl border border-border">
            {templates.map((t, i) => (
              <div key={t.id}>
                {i > 0 && <div className="border-border mx-4 border-t" />}
                <TemplateRow
                  template={t}
                  category={t.id != null ? catMap.get(t.categoryId) : undefined}
                  onEdit={() => handleEdit(t)}
                  onToggleActive={(active) => t.id != null && toggleActive(t.id, active)}
                  onDelete={() => setDeleteTarget(t)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Sheet */}
      <RecurringFormSheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        editTemplate={editTarget}
      />

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o: boolean) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá khoản lặp lại này?</DialogTitle>
            <DialogDescription>
              Các giao dịch đã ghi sẽ không bị ảnh hưởng.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Huỷ</Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-danger text-white hover:opacity-90"
            >
              Xoá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
