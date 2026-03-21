import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'

interface EmojiPickerSheetProps {
  open: boolean
  onClose: () => void
  onSelect: (emoji: string) => void
  currentEmoji?: string
}

export function EmojiPickerSheet({ open, onClose, onSelect, currentEmoji }: EmojiPickerSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="p-0 rounded-t-3xl bg-[#FAFAF8]"
        style={{ maxHeight: '80dvh' }}
      >
        <SheetTitle className="sr-only">Chọn biểu tượng</SheetTitle>
        <SheetDescription className="sr-only">Chọn emoji cho danh mục</SheetDescription>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-surface2" />
        </div>

        {/* Title + current preview */}
        <div className="flex items-center justify-between px-4 pb-3">
          <p className="text-[14px] font-semibold text-text">Chọn biểu tượng</p>
          {currentEmoji && (
            <div className="size-10 rounded-2xl bg-accent-bg flex items-center justify-center text-2xl leading-none">
              {currentEmoji}
            </div>
          )}
        </div>

        {/* Picker */}
        <div className="overflow-hidden">
          <Picker
            data={data}
            onEmojiSelect={(emoji: { native: string }) => {
              onSelect(emoji.native)
              onClose()
            }}
            locale="vi"
            theme="light"
            set="native"
            skinTonePosition="none"
            previewPosition="none"
            searchPosition="sticky"
            navPosition="top"
            perLine={8}
            emojiSize={28}
            emojiButtonSize={40}
            maxFrequentRows={2}
            style={
              {
                '--em-rgb-background': '250, 250, 248',
                '--em-rgb-input': '255, 255, 255',
                '--em-rgb-color': '26, 26, 24',
                '--em-color-border': '#E2E0D8',
                '--em-font-family': 'inherit',
                width: '100%',
                border: 'none',
                borderRadius: 0,
              } as React.CSSProperties
            }
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
