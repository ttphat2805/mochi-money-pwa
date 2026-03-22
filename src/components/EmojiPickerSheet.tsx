import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface EmojiPickerSheetProps {
  open: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  currentEmoji?: string;
}

export function EmojiPickerSheet({
  open,
  onClose,
  onSelect,
}: EmojiPickerSheetProps) {
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 375;
  const perLine = Math.floor(windowWidth / 50);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="p-0 rounded-t-3xl bg-[#FAFAF8]"
        style={{ maxHeight: "80dvh", width: "100%" }}
      >
        <SheetTitle className="sr-only">Chọn biểu tượng</SheetTitle>
        <SheetDescription className="sr-only">
          Chọn emoji cho danh mục
        </SheetDescription>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 bg-white">
          <div className="w-9 h-1 rounded-full bg-surface2" />
        </div>

        {/* Title */}
        <p className="text-center text-sm font-semibold text-text py-3 bg-white">
          Chọn biểu tượng
        </p>

        {/* Picker — no padding, full bleed */}
        <div className="w-full">
          <style>{`
            em-emoji-picker {
              width: 100vw !important;
              max-width: 100vw !important;
              min-width: 100vw !important;
              display: block;
            }
          `}</style>
          <Picker
            data={data}
            onEmojiSelect={(emoji: { native: string }) => {
              onSelect(emoji.native);
              onClose();
            }}
            locale="vi"
            theme="light"
            set="native"
            skinTonePosition="none"
            previewPosition="none"
            searchPosition="sticky"
            navPosition="top"
            perLine={perLine}
            emojiSize={28}
            emojiButtonSize={50}
            maxFrequentRows={2}
            style={
              {
                "--em-rgb-background": "255, 255, 255",
                "--em-rgb-input": "255, 255, 255",
                "--em-rgb-color": "26, 26, 24",
                "--em-color-border": "#E2E0D8",
                "--em-font-family": "inherit",
                width: "100%",
                maxWidth: "100%",
                border: "none",
                borderRadius: 0,
              } as React.CSSProperties
            }
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
