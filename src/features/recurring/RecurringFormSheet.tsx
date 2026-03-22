import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { AmountDisplay } from '@/features/quick-add/AmountDisplay'
import { Numpad } from '@/features/quick-add/Numpad'
import { CategoryGrid } from '@/features/quick-add/CategoryGrid'
import { Switch } from '@/components/ui/switch'
import { SchedulePicker } from './SchedulePicker'
import { useRecurringForm } from '@/hooks/useRecurringForm'
import { useCategoryStore } from '@/stores/categoryStore'
import type { RecurringTemplate } from '@/types'

interface RecurringFormSheetProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<RecurringTemplate, 'id'>, id?: number) => Promise<void>
  editTemplate?: RecurringTemplate
}

export function RecurringFormSheet({ open, onClose, onSave, editTemplate }: RecurringFormSheetProps) {
  const { categories } = useCategoryStore()
  const [isSaving, setIsSaving] = useState(false)
  const isEdit = !!editTemplate

  const form = useRecurringForm(open ? editTemplate : undefined)

  // Reset form when sheet opens or template changes
  useEffect(() => {
    if (open) {
      form.reset(editTemplate)
    }
  }, [open, editTemplate, form.reset]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!form.canSave || isSaving) return
    setIsSaving(true)
    try {
      await onSave(
        {
          name: form.state.name.trim(),
          amount: form.amount,
          categoryId: form.state.categoryId!,
          schedule: form.schedule,
          active: form.state.active,
        },
        editTemplate?.id,
      )
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        showCloseButton={true}
        className="bg-bg rounded-t-2xl p-0 flex flex-col overflow-hidden"
        style={{
          maxHeight: '95dvh',
        }}
      >
        {/* Drag handle */}
        <div className="flex shrink-0 justify-center pt-2.5 pb-1">
          <div className="bg-border2 h-1 w-10 rounded-full" />
        </div>

        <SheetTitle className="sr-only">
          {isEdit ? 'Sửa khoản lặp lại' : 'Thêm khoản lặp lại'}
        </SheetTitle>
        <SheetDescription className="sr-only">
          Nhập thông tin khoản chi lặp lại
        </SheetDescription>

        {/* Scrollable Fields */}
        <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Amount section */}
          <div className="px-4 pt-1">
            <AmountDisplay display={form.amountDisplay} hasValue={form.amount > 0} />
          </div>

          <div className="flex flex-col gap-4 px-4 pb-4">
            {/* Name input */}
            <div className="flex flex-col gap-1.5">
              <span className="text-text-hint text-[10px] font-medium uppercase tracking-[1.2px]">
                Tên khoản
              </span>
              <input
                type="text"
                value={form.state.name}
                onChange={(e) => form.setName(e.target.value)}
                placeholder="VD: Ăn trưa văn phòng"
                maxLength={50}
                className="border-border rounded-xl border bg-white px-4 py-3 text-[14px] outline-none focus:border-accent placeholder:text-text-hint transition-colors"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <span className="text-text-hint text-[10px] font-medium uppercase tracking-[1.2px]">
                Danh mục
              </span>
              <CategoryGrid
                categories={categories}
                selectedId={form.state.categoryId ?? null}
                onSelect={(id) => form.selectCategory(id)}
                scrollable={false}
              />
            </div>

            {/* Schedule */}
            <SchedulePicker
              preset={form.state.schedulePreset}
              customDays={form.state.customDays}
              onPreset={form.setSchedulePreset}
              onToggleDay={form.toggleDay}
            />

            {/* Active toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-medium">Trạng thái</p>
                <p className="text-text-muted text-[11px]">
                  {form.state.active ? 'Đang bật' : 'Đã tắt'}
                </p>
              </div>
              <Switch
                checked={form.state.active}
                onCheckedChange={(checked) => form.setActive(checked)}
                aria-label={form.state.active ? 'Đang bật' : 'Đã tắt'}
              />
            </div>
          </div>
        </div>

        {/* Fixed Numpad at the bottom */}
        <div className="shrink-0 bg-bg pb-safe">
          <Numpad
            onDigit={form.appendDigit}
            onDelete={form.deleteDigit}
            onConfirm={handleSave}
            canConfirm={form.canSave}
            isSaving={isSaving}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
