import { useState } from "react";
import { toast } from "sonner";
import { formatVND } from "@/lib/utils";
import { useQuickAdd } from "@/hooks/useQuickAdd";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { AmountDisplay } from "./AmountDisplay";
import { Numpad } from "./Numpad";
import { CategoryGrid } from "./CategoryGrid";
import { NoteInput } from "./NoteInput";
import { DateSelector } from "./DateSelector";
import { DatePickerSheet } from "./DatePickerSheet";
import { BudgetWarningDialog } from "./BudgetWarningDialog";

interface QuickAddSheetProps {
  quickAdd: ReturnType<typeof useQuickAdd>;
}

export function QuickAddSheet({ quickAdd }: QuickAddSheetProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);

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

  const handleSave = async () => {
    const result = await save();
    if (result.success) {
      toast.success(
        `Đã ghi −${formatVND(result.amount)}đ · ${result.categoryName}`,
      );
    }
  };

  const handleConfirmOverBudget = async () => {
    const result = await confirmOverBudget();
    if (result.success) {
      toast.success(
        `Đã ghi −${formatVND(result.amount)}đ · ${result.categoryName}`,
      );
    }
  };

  const handleDateConfirm = (date: string) => {
    setDate(date); // update date in Quick Add
    // Delay closing by a tick so Radix UI event bubbling finishes evaluating datePickerOpen
    setTimeout(() => setDatePickerOpen(false), 50);
  };

  const handleDatePickerClose = () => {
    setTimeout(() => setDatePickerOpen(false), 50);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          onPointerDownOutside={(e) => {
            if (datePickerOpen) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (datePickerOpen) e.preventDefault();
          }}
          onFocusOutside={(e) => {
            if (datePickerOpen) e.preventDefault();
          }}
          className="bg-bg rounded-t-2xl p-0"
        >
          <div className="flex flex-col">
            {/* 1. Drag handle */}
            <div className="flex justify-center pt-2.5 pb-1">
              <div className="bg-border2 h-1 w-10 rounded-full" />
            </div>

            <SheetTitle className="sr-only">Thêm chi tiêu</SheetTitle>
            <SheetDescription className="sr-only">
              Nhập số tiền và chọn danh mục để ghi chi tiêu
            </SheetDescription>

            {/* 2. Amount display */}
            <div className="px-4">
              <AmountDisplay display={amountDisplay} hasValue={amount > 0} onClear={clearAmount} />
            </div>

            {/* 3. Category grid */}
            <div className="mt-1">
              <div className="px-4 pb-1.5">
                <span className="text-text-muted text-[11px] font-medium uppercase tracking-[1px]">
                  Danh mục
                </span>
              </div>

              <CategoryGrid
                categories={sortedCategories}
                selectedId={selectedCategoryId}
                onSelect={selectCategory}
                showAdd
                className="px-4"
              />
            </div>

            {/* 4. Note + Date row */}
            <div className="mx-4 mt-3 flex items-end gap-3">
              <NoteInput value={note} onChange={setNote} />
              <DateSelector
                dateLabel={dateLabel}
                onTap={() => setDatePickerOpen(true)}
              />
            </div>

            {/* 5. Numpad — anchored to bottom */}
            <div className="mt-3">
              <Numpad
                onDigit={appendDigit}
                onDelete={deleteDigit}
                onConfirm={handleSave}
                canConfirm={canSave}
                isSaving={isSaving}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Date Picker Sheet — rendered as a sibling, NOT nested inside above Sheet.
          Its lifecycle is fully independent from QuickAddSheet's open state. */}
      <DatePickerSheet
        open={datePickerOpen}
        onClose={handleDatePickerClose}
        onConfirm={handleDateConfirm}
        initialDate={selectedDate}
      />

      {/* Budget warning dialog */}
      <BudgetWarningDialog
        warning={budgetWarning}
        onConfirm={handleConfirmOverBudget}
        onCancel={dismissBudgetWarning}
      />
    </>
  );
}
