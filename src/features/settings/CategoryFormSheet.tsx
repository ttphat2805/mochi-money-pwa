import { useState, useEffect, lazy, Suspense } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { formatVND } from '@/lib/utils'
import type { BudgetCategory } from '@/types'

const EmojiPickerSheet = lazy(() => import('@/components/EmojiPickerSheet').then((m) => ({ default: m.EmojiPickerSheet })))

interface CategoryFormSheetProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<BudgetCategory, 'id' | 'sortOrder' | 'color'>, id?: number) => Promise<void>
  editCategory?: BudgetCategory
  /** Called when user taps "Xoá danh mục" — parent handles the confirm dialog */
  onDelete?: () => void
}

const DEFAULT_ICON = '📦'

export function CategoryFormSheet({
  open,
  onClose,
  onSave,
  editCategory,
  onDelete,
}: CategoryFormSheetProps) {
  const isEdit = !!editCategory

  const [name, setName] = useState(editCategory?.name ?? '')
  const [icon, setIcon] = useState(editCategory?.icon ?? DEFAULT_ICON)
  const [limitEnabled, setLimitEnabled] = useState(editCategory?.limitPerMonth != null)
  const [limitRaw, setLimitRaw] = useState(
    editCategory?.limitPerMonth ? String(editCategory.limitPerMonth) : '',
  )
  const [isSaving, setIsSaving] = useState(false)
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)

  // Sync when editCategory changes (sheet opens with different target)
  useEffect(() => {
    if (open) {
      setName(editCategory?.name ?? '')
      setIcon(editCategory?.icon ?? DEFAULT_ICON)
      setLimitEnabled(editCategory?.limitPerMonth != null)
      setLimitRaw(editCategory?.limitPerMonth ? String(editCategory.limitPerMonth) : '')
    }
  }, [open, editCategory?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const limitAmount = parseInt(limitRaw.replace(/\D/g, '') || '0', 10)
  const canSave = name.trim().length > 0 && (!limitEnabled || limitAmount > 0)

  const handleLimitInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '')
    setLimitRaw(digits)
  }

  const handleSave = async () => {
    if (!canSave || isSaving) return
    setIsSaving(true)
    try {
      await onSave(
        {
          name: name.trim(),
          icon,
          limitPerMonth: limitEnabled && limitAmount > 0 ? limitAmount : null,
        },
        editCategory?.id,
      )
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          side="bottom"
          showCloseButton={true}
          className="rounded-t-3xl bg-white p-0"
          style={{ maxHeight: '90dvh' }}
        >
          <SheetTitle className="sr-only">
            {isEdit ? 'Sửa danh mục' : 'Thêm danh mục'}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Quản lý danh mục và giới hạn ngân sách
          </SheetDescription>

          {/* Handle */}
          <div className="flex justify-center pt-3 pb-0">
            <div className="w-9 h-1 rounded-full bg-surface2" />
          </div>

          <div className="overflow-y-auto px-5 py-4 flex flex-col gap-5">
            {/* ── Emoji selector ── */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setEmojiPickerOpen(true)}
                className="relative size-20 rounded-3xl bg-accent-bg flex items-center justify-center text-4xl leading-none transition-transform active:scale-95"
                aria-label="Thay đổi biểu tượng"
              >
                {icon}
                {/* Edit badge */}
                <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-accent flex items-center justify-center shadow-sm">
                  <Pencil size={10} color="white" />
                </div>
              </button>
              <p className="text-[11px] text-text-hint">Nhấn để đổi biểu tượng</p>
            </div>

            {/* ── Name input ── */}
            <div className="flex flex-col gap-1.5">
              <span className="text-text-hint text-[10px] font-medium uppercase tracking-[1.2px]">
                Tên danh mục
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Ăn uống, Di chuyển..."
                maxLength={40}
                autoFocus={!isEdit}
                className="border-border rounded-xl border bg-surface px-4 py-3 text-[14px] outline-none focus:border-accent placeholder:text-text-hint transition-colors"
              />
            </div>

            {/* ── Budget limit toggle + amount ── */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between bg-surface rounded-xl px-4 py-3">
                <div>
                  <p className="text-[14px] font-medium">Giới hạn ngân sách</p>
                  <p className="text-text-muted text-[11px] mt-0.5">
                    {limitEnabled
                      ? limitAmount > 0
                        ? formatVND(limitAmount) + 'đ / tháng'
                        : 'Nhập số tiền bên dưới'
                      : 'App sẽ cảnh báo khi gần đạt giới hạn'}
                  </p>
                </div>
                <Switch
                  checked={limitEnabled}
                  onCheckedChange={setLimitEnabled}
                  aria-label="Bật giới hạn"
                />
              </div>

              {limitEnabled && (
                <div className="border-border rounded-xl border bg-white px-4 py-3 flex items-center gap-2">
                  <div className="flex-1">
                    <p className="text-text-hint text-[10px] uppercase tracking-[1px] mb-1">
                      Giới hạn mỗi tháng
                    </p>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={limitRaw ? new Intl.NumberFormat('vi-VN').format(parseInt(limitRaw || '0', 10)) : ''}
                      onChange={handleLimitInput}
                      placeholder="500.000"
                      className="w-full text-[18px] font-semibold font-mono outline-none bg-transparent placeholder:text-text-hint"
                    />
                  </div>
                  <span className="text-[14px] text-text-muted shrink-0">đ</span>
                </div>
              )}
            </div>

            {/* ── Save button ── */}
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || isSaving}
              className="h-12 w-full rounded-[14px] bg-text text-white text-[15px] font-semibold disabled:opacity-40 transition-all active:scale-[0.98]"
            >
              {isSaving ? '...' : isEdit ? 'Lưu thay đổi' : 'Thêm danh mục'}
            </button>

            {/* ── Delete button (edit mode only) ── */}
            {isEdit && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="h-11 w-full rounded-[14px] text-[14px] text-danger font-medium flex items-center justify-center gap-2 transition-colors active:bg-danger-bg"
              >
                <Trash2 size={15} />
                Xoá danh mục
              </button>
            )}

            {/* Safe-area bottom spacing */}
            <div className="safe-bottom h-0" />
          </div>
        </SheetContent>
      </Sheet>

      {/* Emoji picker — separate sheet on top */}
      {emojiPickerOpen && (
        <Suspense fallback={null}>
          <EmojiPickerSheet
            open={emojiPickerOpen}
            onClose={() => setEmojiPickerOpen(false)}
            onSelect={setIcon}
          />
        </Suspense>
      )}
    </>
  )
}
