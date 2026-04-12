import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useQuickAdd } from "@/hooks/useQuickAdd";
import { triggerHaptic } from "@/lib/haptic";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [successAnim, setSuccessAnim] = useState({
    isVisible: false,
    amount: 0,
  });
  const [initialCategoryId, setInitialCategoryId] = useState<number | null>(
    null,
  );
  const [isNoteFocused, setIsNoteFocused] = useState(false);

  const {
    amount,
    amountDisplay,
    selectedCategoryId,
    selectedDate,
    note,
    isOpen,
    isSaving,
    budgetWarning,
    sortedCategories,
    close,
    appendDigit,
    deleteDigit,
    clearAmount,
    selectCategory,
    setDate,
    setNote,
    save,
    confirmOverBudget,
    dismissBudgetWarning,
    canSave,
    dateLabel,
  } = quickAdd;

  // Lock selected category position to prevent grid jumping on re-select
  useEffect(() => {
    if (isOpen && initialCategoryId === null) {
      setInitialCategoryId(selectedCategoryId);
    } else if (!isOpen) {
      setInitialCategoryId(null);
    }
  }, [isOpen, selectedCategoryId]);

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
            "bg-[#F7F5F0] rounded-t-[32px] p-0 shadow-2xl overflow-hidden border-none flex flex-col transition-all duration-300",
            "h-[82dvh] max-h-[82dvh]",
          )}
        >
          <div className="flex flex-col h-full overflow-hidden">
            {/* ── HEADER: close + amount + date ── */}
            <div className="px-5 pt-3 pb-3 shrink-0 bg-[#F7F5F0]">
              {/* Top row */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black tracking-[2px] text-black/30 uppercase">
                  Chi tiêu
                </span>
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

            {/* ── Fixed Bottom Area: Note + Numpad ── */}
            <div
              className="px-5 pb-[calc(10px+env(safe-area-inset-bottom))] shrink-0 bg-[#F7F5F0] pt-2 border-t border-black/5"
            >
              <div className="mb-3">
                <NoteInput value={note} onChange={setNote} onFocusChange={(focused) => {
                  // Small delay to ensure smooth transition
                  setIsNoteFocused(focused);
                }} />
              </div>
              
              <AnimatePresence initial={false}>
                {!isNoteFocused && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <Numpad
                      onDigit={appendDigit}
                      onDelete={deleteDigit}
                      onConfirm={handleSave}
                      canConfirm={canSave}
                      isSaving={isSaving}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
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
