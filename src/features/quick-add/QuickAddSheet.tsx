import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useQuickAdd } from "@/hooks/useQuickAdd";
import { triggerHaptic } from "@/lib/haptic";
import { cn } from "@/lib/utils";
import { X, Info } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { AmountDisplay } from "./AmountDisplay";
import { BudgetWarningDialog } from "./BudgetWarningDialog";
import { CategoryGrid } from "./CategoryGrid";
import { DatePickerSheet } from "./DatePickerSheet";
import { DateSelector } from "./DateSelector";
import { FloatingSuccessAnimation } from "./FloatingSuccessAnimation";
import { NoteInput } from "./NoteInput";
import { Numpad } from "./Numpad";

interface QuickAddSheetProps {
  quickAdd: ReturnType<typeof useQuickAdd>;
}

export function QuickAddSheet({ quickAdd }: QuickAddSheetProps) {
  const { isOpen } = quickAdd;
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [successAnim, setSuccessAnim] = useState({
    isVisible: false,
    amount: 0,
  });
  const [initialCategoryId, setInitialCategoryId] = useState<number | null>(
    null,
  );
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Sync initialCategoryId during render when the sheet opens/closes.
  // This is the recommended React 18+ pattern for 'adjusting state based on props'.
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setInitialCategoryId(quickAdd.selectedCategoryId);
    } else {
      setInitialCategoryId(null);
    }
  }

  const {
    amount,
    amountDisplay,
    selectedCategoryId,
    selectedDate,
    note,
    isSaving,
    budgetWarning,
    isNote,
    sortedCategories,
    close,
    appendDigit,
    deleteDigit,
    clearAmount,
    selectCategory,
    setDate,
    setNote,
    toggleIsNote,
    addAmount,
    save,
    confirmOverBudget,
    dismissBudgetWarning,
    canSave,
    dateLabel,
  } = quickAdd;

  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showNoteTooltip, setShowNoteTooltip] = useState(false);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss tooltip after 3s
  useEffect(() => {
    if (showNoteTooltip) {
      tooltipTimerRef.current = setTimeout(() => setShowNoteTooltip(false), 3000);
    }
    return () => {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    };
  }, [showNoteTooltip]);

  const handleSave = async () => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    const result = await save();
    if (result.success) {
      if (result.isFirst) {
        toast.success("Đã ghi thành công! 🎉", { duration: 4000 });
        triggerHaptic("success");
      } else {
        triggerHaptic("success");
        setSuccessAnim({ isVisible: true, amount: result.amount });
        setTimeout(() => setSuccessAnim({ isVisible: false, amount: 0 }), 1500);
      }
    }
  };

  const handleShortcut = (shortcutAmount: number) => {
    addAmount(shortcutAmount)
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !datePickerOpen) close();
  };

  const handleDateConfirm = (date: string) => {
    setDate(date);
    setTimeout(() => setDatePickerOpen(false), 50);
  };

  // Sort: keep initial selection at top to prevent layout jumps
  const sortedForDisplay = [...sortedCategories].sort((a, b) => {
    if (a.id === initialCategoryId) return -1;
    if (b.id === initialCategoryId) return 1;
    return 0;
  });

  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className={cn(
            "bg-[#F7F5F0] rounded-t-[32px] p-0 shadow-2xl border-none flex flex-col",
          )}
          style={{ height: '92dvh', maxHeight: '96dvh' }}
        >
          <div className="flex flex-col h-full">
            {/* ── HEADER: close + amount + date ── */}
            <div className="px-5 pt-3 pb-3 shrink-0 bg-[#F7F5F0]">
              {/* Top row: title + isNote switch + date + close */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Title */}
                  <span className={`text-[11px] font-black tracking-[2px] uppercase ${
                    isNote ? 'text-indigo-400' : 'text-black/30'
                  }`}>
                    {isNote ? 'Ghi chú' : 'Chi tiêu'}
                  </span>

                  {/* Compact toggle switch */}
                  <button
                    type="button"
                    onClick={toggleIsNote}
                    aria-label="Bật/tắt chế độ ghi chú"
                    className="relative flex-shrink-0"
                  >
                    <div className={`relative w-8 h-[18px] rounded-full transition-colors duration-200 ${
                      isNote ? 'bg-indigo-500' : 'bg-black/15'
                    }`}>
                      <div className={`absolute top-[2px] size-[14px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        isNote ? 'translate-x-[18px]' : 'translate-x-[2px]'
                      }`} />
                    </div>
                  </button>

                  {/* Info button + popover */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowNoteTooltip((v) => !v)}
                      aria-label="Giải thích ghi chú"
                      className="flex items-center justify-center size-[18px] rounded-full text-black/25 active:text-black/50 transition-colors"
                    >
                      <Info size={13} />
                    </button>

                    {/* Floating tooltip */}
                    {showNoteTooltip && (
                      <div
                        className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-[220px] rounded-2xl bg-[#1C1C1E] shadow-xl p-3 text-left"
                        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.22)' }}
                      >
                        {/* Arrow */}
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 size-3 rotate-45 bg-[#1C1C1E]" />
                        <p className="text-white text-[12px] font-semibold mb-1">📓 Ghi chú
                          <span className="font-normal text-white/60"> (không tính chi tiêu)</span>
                        </p>
                        <p className="text-white/65 text-[11px] leading-[1.5]">
                          Giao dịch này sẽ được lưu nhưng không ảnh hưởng đến tổng chi tiêu, ngân sách hay biểu đồ. Dùng cho các khoản như học phí, đầu tư một lần...
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DateSelector
                    dateLabel={dateLabel}
                    onTap={() => setDatePickerOpen(true)}
                  />
                  <button
                    onClick={close}
                    className="!min-h-7 size-7 rounded-full bg-black/6 flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <X size={13} className="text-black/40" />
                  </button>
                </div>
              </div>

              {/* Big amount display */}
              <AmountDisplay
                display={amountDisplay}
                hasValue={amount > 0}
                onClear={clearAmount}
              />
            </div>

            {/* ── Scrollable: Categories ONLY ── */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-5 min-h-0">
              {/* Category label */}
              <span className="text-text-muted text-[10px] font-black uppercase tracking-[1.5px] block mb-2">
                Danh mục
              </span>

              {/* Category grid */}
              <CategoryGrid
                categories={sortedForDisplay}
                selectedId={selectedCategoryId}
                onSelect={(id) => {
                  selectCategory(id);
                  triggerHaptic("light");
                  if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                  }
                }}
              />
              {/* Extra space for scrolling */}
              <div className="h-4" />
            </div>

            <div
              className="px-5 pb-[calc(10px+env(safe-area-inset-bottom))] shrink-0 bg-[#F7F5F0] pt-2 border-t border-black/5"
            >
              <div className="mb-3 relative">
                <NoteInput 
                  value={note} 
                  onChange={setNote} 
                  onFocusChange={setIsInputFocused}
                />
                {/* "Done" overlay button — only visible when keyboard is open */}
                {isInputFocused && (
                  <button
                    onPointerDown={(e) => {
                      // Prevent the input from regaining focus
                      e.preventDefault()
                      if (document.activeElement instanceof HTMLElement)
                        document.activeElement.blur()
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-3 rounded-full bg-text text-white text-[12px] font-semibold active:scale-90 transition-transform"
                  >
                    Xong
                  </button>
                )}
              </div>

              {/* (isNote big block removed — now compact switch in header) */}
              <Numpad
                onDigit={appendDigit}
                onDelete={deleteDigit}
                onConfirm={handleSave}
                onShortcut={handleShortcut}
                canConfirm={canSave}
                isSaving={isSaving}
                isNote={isNote}
              />
            </div>

          </div>
        </SheetContent>
      </Sheet>

      <DatePickerSheet
        open={datePickerOpen}
        onClose={() => setDatePickerOpen(false)}
        onConfirm={handleDateConfirm}
        initialDate={selectedDate}
      />

      <BudgetWarningDialog
        warning={budgetWarning}
        onConfirm={async () => {
          const result = await confirmOverBudget();
          if (result.success) {
            triggerHaptic("success");
            setSuccessAnim({ isVisible: true, amount: result.amount });
            setTimeout(
              () => setSuccessAnim({ isVisible: false, amount: 0 }),
              1500,
            );
          }
        }}
        onCancel={dismissBudgetWarning}
      />

      <FloatingSuccessAnimation
        isVisible={successAnim.isVisible}
        amount={successAnim.amount}
      />
    </>
  );
}
