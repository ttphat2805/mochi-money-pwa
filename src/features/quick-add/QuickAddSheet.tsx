import {
  Sheet,
  SheetContent
} from "@/components/ui/sheet";
import { useQuickAdd } from "@/hooks/useQuickAdd";
import { triggerHaptic } from "@/lib/haptic";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
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
  const [successAnim, setSuccessAnim] = useState({ isVisible: false, amount: 0 });
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [initialCategoryId, setInitialCategoryId] = useState<number | null>(null);
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

  // Capture the starting category when the sheet opens to prevent list jumping during selection
  useEffect(() => {
    if (isOpen && initialCategoryId === null) {
      setInitialCategoryId(selectedCategoryId);
    } else if (!isOpen) {
      setInitialCategoryId(null);
    }
  }, [isOpen, selectedCategoryId]);


  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') setIsKeyboardOpen(true);
    };
    const handleBlur = () => setIsKeyboardOpen(false);
    window.addEventListener('focusin', handleFocus);
    window.addEventListener('focusout', handleBlur);
    return () => {
      window.removeEventListener('focusin', handleFocus);
      window.removeEventListener('focusout', handleBlur);
    };
  }, []);

  const handleSave = async () => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    const result = await save();
    if (result.success) {
      if (result.isFirst) {
        toast.success("Đã ghi thành công! 🎉", { duration: 4000 });
        triggerHaptic('success');
      } else {
        triggerHaptic('success');
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

  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className={cn(
            "bg-bg rounded-t-[40px] p-0 transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-2xl overflow-hidden border-none",
            isKeyboardOpen ? "h-[94dvh]" : "h-auto max-h-[92dvh]"
          )}
        >
          <div className="flex flex-col h-full relative">
            {/* Header / Amount Branding */}
            <div className="px-6 pt-5 pb-2 flex flex-col items-center bg-bg relative">
               <div className="absolute top-2 w-12 h-1.5 rounded-full bg-border/40 mb-4" />
               <div className="w-full flex justify-between items-center mb-1 mt-4">
                  <span className="text-[10px] font-black tracking-[2px] text-text-hint/70 uppercase">Số Tiền</span>
                  <button onClick={close} className="size-8 rounded-full bg-surface items-center justify-center flex active:scale-90 transition-transform">
                    <X size={14} className="text-text-muted" />
                  </button>
               </div>
               <AmountDisplay display={amountDisplay} hasValue={amount > 0} onClear={clearAmount} />
            </div>

            {/* Middle Section: Swipable Categories & Intel */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-6 space-y-6 pb-6">
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <span className="text-text-muted text-[10px] font-black uppercase tracking-[1.5px]">Danh mục</span>
                   </div>
                  {/* 
                      Senior UX Reordering: Hoist selected category to the first position.
                      This ensures the active choice is instantly visible on edit without scrolling.
                   */}
                   <CategoryGrid
                    categories={[...sortedCategories].sort((a, b) => {
                       if (a.id === initialCategoryId) return -1;
                       if (b.id === initialCategoryId) return 1;
                       return 0;
                    })}
                    selectedId={selectedCategoryId}
                    onSelect={(id) => {
                        selectCategory(id);
                        triggerHaptic('light');
                        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
                    }}
                    showAdd
                  />
                </div>

                <div className="space-y-3">
                   <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <NoteInput value={note} onChange={setNote} />
                        </div>
                        <DateSelector dateLabel={dateLabel} onTap={() => setDatePickerOpen(true)} />
                   </div>
                </div>

                {isKeyboardOpen && <div className="h-64" />}
            </div>

            <div className={cn(
              "px-6 pb-[calc(16px+env(safe-area-inset-bottom))]",
              isKeyboardOpen ? "hidden" : "block"
            )}>
              <Numpad
                onDigit={appendDigit}
                onDelete={deleteDigit}
                onConfirm={handleSave}
                canConfirm={canSave}
                isSaving={isSaving}
              />
            </div>

            {/* Keyboard Dismiss Bar */}
            {isKeyboardOpen && (
              <div className="flex items-center justify-end px-4 py-2 bg-white border-t border-border/40 safe-bottom">
                <button 
                  onClick={() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); }}
                  className="text-[14px] font-black text-accent px-5 py-2.5 bg-accent/5 rounded-full"
                >
                  Xong
                </button>
              </div>
            )}
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
                triggerHaptic('success');
                setSuccessAnim({ isVisible: true, amount: result.amount });
                setTimeout(() => setSuccessAnim({ isVisible: false, amount: 0 }), 1500);
            }
        }}
        onCancel={dismissBudgetWarning}
      />

      <FloatingSuccessAnimation isVisible={successAnim.isVisible} amount={successAnim.amount} />
    </>
  );
}
