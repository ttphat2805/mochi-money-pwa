import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { CATEGORY_ICONS } from '@/lib/categoryIcons'
import { triggerHaptic } from '@/lib/haptic'
import { cn } from '@/lib/utils'

interface IconPickerSheetProps {
  open: boolean
  onClose: () => void
  onSelect: (iconName: string) => void
  currentIcon?: string
}

export function IconPickerSheet({
  open,
  onClose,
  onSelect,
  currentIcon,
}: IconPickerSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        showCloseButton={true}
        className="p-0 rounded-t-3xl bg-card"
        style={{ maxHeight: '80dvh', width: '100%' }}
      >
        <SheetTitle className="sr-only">Chọn biểu tượng</SheetTitle>
        <SheetDescription className="sr-only">
          Chọn biểu tượng cho danh mục
        </SheetDescription>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-surface2" />
        </div>

        <p className="text-center text-sm font-semibold text-text py-3">
          Chọn biểu tượng
        </p>

        <div className="overflow-y-auto px-4 pb-6 safe-bottom">
          <div className="grid grid-cols-6 gap-2">
            {CATEGORY_ICONS.map(({ name, Icon }) => {
              const isSelected = currentIcon === name
              return (
                <button
                  key={name}
                  type="button"
                  aria-label={name}
                  aria-pressed={isSelected}
                  onClick={() => {
                    triggerHaptic('light')
                    onSelect(name)
                    onClose()
                  }}
                  className={cn(
                    'flex aspect-square items-center justify-center rounded-2xl transition-colors active:scale-95',
                    isSelected
                      ? 'bg-accent-bg text-accent-dark border-[1.5px] border-accent'
                      : 'bg-surface text-text-muted border-[1.5px] border-transparent',
                  )}
                >
                  <Icon size={22} strokeWidth={2} />
                </button>
              )
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
