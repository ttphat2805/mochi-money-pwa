import { useState, useEffect, memo, useCallback } from 'react'
import { ArrowLeft, Plus, GripVertical, ChevronRight } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { formatVND } from '@/lib/utils'
import { useBudgetCategories, type CategoryWithBudget } from '@/hooks/useBudgetCategories'
import { CategoryFormSheet } from './CategoryFormSheet'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import type { BudgetCategory } from '@/types'

interface CategoryListPageProps {
  onBack: () => void
}

// ── Pure display row (used in DragOverlay only) ─────────────────

export const CategoryRowContent = memo(function CategoryRowContent({
  category,
  isDragOverlay = false,
}: {
  category: CategoryWithBudget
  isDragOverlay?: boolean
}) {
  return (
    <div
      className="flex items-center gap-3 bg-white px-4 py-3"
      style={{
        border: isDragOverlay ? '1.5px solid #E8A020' : undefined,
        boxShadow: isDragOverlay ? '0 8px 24px rgba(0,0,0,0.12)' : undefined,
        borderRadius: isDragOverlay ? 14 : undefined,
      }}
    >
      {/* Drag handle placeholder (no props — overlay can't drag) */}
      <div className="shrink-0 flex items-center justify-center p-1 -ml-1 text-[#C0BEB4]">
        <GripVertical size={16} />
      </div>

      {/* Icon */}
      <div className="size-9 shrink-0 flex items-center justify-center rounded-xl bg-surface text-xl leading-none">
        {category.icon}
      </div>

      {/* Name + budget */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-text truncate">{category.name}</p>
        <p className="text-[11px] text-text-muted mt-0.5 font-mono">
          {category.limitPerMonth ? `Giới hạn ${formatVND(category.limitPerMonth)}đ` : 'Không giới hạn'}
        </p>
      </div>

      <ChevronRight size={16} className="text-text-hint shrink-0" />
    </div>
  )
})

// ── Sortable row wrapper ──────────────────────────────────────

export const SortableCategoryRow = memo(function SortableCategoryRow({
  category,
  onEdit,
}: {
  category: CategoryWithBudget
  onEdit: (cat: BudgetCategory) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: category.id! })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
      }}
    >
      {/* The full row is a tappable button that opens edit */}
      <button
        type="button"
        onClick={() => onEdit(category)}
        className="flex items-center gap-3 bg-white px-4 py-3 w-full text-left transition-colors active:bg-surface"
      >
        {/* Drag handle — stopPropagation so dragging doesn't trigger edit */}
        <div
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 flex items-center justify-center p-1 -ml-1 text-[#C0BEB4] touch-none cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
        >
          <GripVertical size={16} />
        </div>

        {/* Icon */}
        <div className="size-9 shrink-0 flex items-center justify-center rounded-xl bg-surface text-xl leading-none">
          {category.icon}
        </div>

        {/* Name + subtitle */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium text-text truncate">{category.name}</p>
          <p className="text-[11px] text-text-muted mt-0.5 font-mono">
            {category.limitPerMonth
              ? `Giới hạn ${formatVND(category.limitPerMonth)}đ`
              : 'Không giới hạn'}
          </p>
        </div>

        <ChevronRight size={16} className="text-text-hint shrink-0" />
      </button>
    </div>
  )
})

// ── Main page ─────────────────────────────────────────────────

export function CategoryListPage({ onBack }: CategoryListPageProps) {
  const { categoriesWithBudget, addCategory, updateCategory, deleteCategory, reorderCategories } =
    useBudgetCategories()

  // Local optimistic list for smooth DnD
  const [items, setItems] = useState<CategoryWithBudget[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [editTarget, setEditTarget] = useState<BudgetCategory | undefined>()
  const [formOpen, setFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BudgetCategory | null>(null)

  // Sync from DB (but not during drag)
  useEffect(() => {
    if (activeId == null) {
      setItems(categoriesWithBudget)
    }
  }, [categoriesWithBudget, activeId])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((c) => c.id === active.id)
    const newIndex = items.findIndex((c) => c.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex)

    setItems(reordered) // optimistic
    await reorderCategories(reordered.map((c, i) => ({ id: c.id!, sortOrder: i })))
  }

  const activeCategory = items.find((c) => c.id === activeId)

  const handleEdit = useCallback((cat: BudgetCategory) => {
    setEditTarget(cat)
    setFormOpen(true)
  }, [])

  const handleAdd = () => {
    setEditTarget(undefined)
    setFormOpen(true)
  }

  const handleSave = async (data: Omit<BudgetCategory, 'id' | 'sortOrder' | 'color'>, id?: number) => {
    if (id != null) {
      await updateCategory(id, data)
    } else {
      await addCategory(data)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return
    await deleteCategory(deleteTarget.id, deleteTarget.name)
    setDeleteTarget(null)
    setFormOpen(false)
  }

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
          <h1 className="flex-1 text-center text-base font-semibold">Quản lý danh mục</h1>
          <button
            type="button"
            onClick={handleAdd}
            className="bg-surface active:bg-surface2 flex size-8 items-center justify-center rounded-full transition-colors"
            aria-label="Thêm danh mục"
          >
            <Plus className="size-4" />
          </button>
        </header>

        {/* List */}
        <div className="flex-1 overflow-y-auto pb-8">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20">
              <p className="text-3xl">📂</p>
              <p className="text-text-muted text-[13px]">Chưa có danh mục nào</p>
              <p className="text-text-hint text-[11px]">Nhấn + để thêm</p>
            </div>
          ) : (
            <div className="mt-2 mx-4 rounded-xl overflow-hidden border border-border bg-white">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items.map((c) => c.id!)}
                  strategy={verticalListSortingStrategy}
                >
                  {items.map((cat, idx) => (
                    <div key={cat.id}>
                      {idx > 0 && <div className="border-border mx-4 border-t" />}
                      <SortableCategoryRow
                        category={cat}
                        onEdit={handleEdit}
                      />
                    </div>
                  ))}
                </SortableContext>

                {/* Floating clone while dragging */}
                <DragOverlay dropAnimation={null}>
                  {activeCategory ? (
                    <div className="rounded-[14px] overflow-hidden shadow-xl">
                      <CategoryRowContent category={activeCategory} isDragOverlay />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          )}

          <p className="mt-3 text-center text-text-hint text-[11px]">
            {items.length > 0 && `${items.length} danh mục · Giữ ☰ để sắp xếp`}
          </p>
        </div>
      </div>

      {/* Edit / Add form sheet */}
      <CategoryFormSheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        editCategory={editTarget}
        onDelete={editTarget ? () => setDeleteTarget(editTarget) : undefined}
      />

      {/* Delete confirm dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Xoá danh mục này?"
        description="Các giao dịch đã ghi vẫn sẽ được giữ lại."
        confirmLabel="Xoá"
      />
    </>
  )
}
