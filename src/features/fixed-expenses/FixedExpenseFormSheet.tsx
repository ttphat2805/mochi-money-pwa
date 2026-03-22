import { useState, useCallback, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { AmountDisplay } from "@/features/quick-add/AmountDisplay";
import { Numpad } from "@/features/quick-add/Numpad";
import { CategoryGrid } from "@/features/quick-add/CategoryGrid";
import { DayOfMonthPicker } from "@/components/DayOfMonthPicker";
import { useCategoryStore } from "@/stores/categoryStore";
import type { FixedExpense } from "@/types";

interface FixedExpenseFormSheetProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<FixedExpense, "id">, id?: number) => Promise<void>;
  editExpense?: FixedExpense;
}

function useFixedExpenseForm(editExpense?: FixedExpense) {
  // Amount
  const [rawDigits, setRawDigits] = useState<string>("0");

  const appendDigit = useCallback((d: number) => {
    setRawDigits((prev) => {
      if (prev === "0" && d === 0) return prev;
      const next = prev === "0" ? String(d) : prev + String(d);
      return next.length > 11 ? prev : next;
    });
  }, []);

  const deleteDigit = useCallback(() => {
    setRawDigits((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)));
  }, []);

  const amount = parseInt(rawDigits, 10) || 0;

  // Format with dots
  const amountDisplay = amount === 0 ? "" : amount.toLocaleString("vi-VN");

  // Fields
  const [name, setName] = useState("");
  const [payDay, setPayDay] = useState(1);
  const [note, setNote] = useState("");
  const [active, setActive] = useState(true);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);

  // Reset when sheet opens
  const reset = useCallback(() => {
    if (editExpense) {
      setRawDigits(String(editExpense.amount));
      setName(editExpense.name);
      setPayDay(editExpense.payDay);
      setNote(editExpense.note);
      setActive(editExpense.active);
      setCategoryId(editExpense.categoryId);
    } else {
      setRawDigits("0");
      setName("");
      setPayDay(1);
      setNote("");
      setActive(true);
      setCategoryId(undefined);
    }
  }, [editExpense]);

  const canSave = amount > 0 && name.trim().length > 0 && categoryId !== undefined;
  const clearAmount = () => setRawDigits("0");

  return {
    rawDigits,
    amount,
    amountDisplay,
    appendDigit,
    deleteDigit,
    clearAmount,
    name,
    setName,
    payDay,
    setPayDay,
    note,
    setNote,
    active,
    setActive,
    categoryId,
    setCategoryId,
    canSave,
    reset,
  };
}

export function FixedExpenseFormSheet({
  open,
  onClose,
  onSave,
  editExpense,
}: FixedExpenseFormSheetProps) {
  const { categories } = useCategoryStore();
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = !!editExpense;
  const form = useFixedExpenseForm(editExpense);

  const clearAmount = () => form.clearAmount();

  // Reset form each time sheet opens programmatically
  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, editExpense, form.reset]);

  const handleOpenChange = (o: boolean) => {
    if (!o) onClose();
  };

  const handleSave = async () => {
    if (!form.canSave || isSaving) return;
    setIsSaving(true);
    try {
      await onSave(
        {
          name: form.name.trim(),
          amount: form.amount,
          payDay: form.payDay,
          note: form.note,
          active: form.active,
          categoryId: form.categoryId!,
        },
        editExpense?.id,
      );
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
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
          {isEdit ? "Sửa chi phí cố định" : "Thêm chi phí cố định"}
        </SheetTitle>
        <SheetDescription className="sr-only">
          Nhập thông tin chi phí lặp lại hằng tháng
        </SheetDescription>

        {/* Scrollable Fields */}
        <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Amount display */}
          <div className="px-4 pt-1">
            <AmountDisplay
              display={form.amountDisplay}
              hasValue={form.amount > 0}
              onClear={clearAmount}
            />
          </div>

          <div className="flex flex-col gap-4 px-4 pb-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <span className="text-text-hint text-[10px] font-medium uppercase tracking-[1.2px]">
                Tên chi phí
              </span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => form.setName(e.target.value)}
                placeholder="VD: Tiền nhà, Điện nước..."
                maxLength={50}
                className="border-border rounded-xl border bg-white px-4 py-3 text-[14px] outline-none focus:border-accent placeholder:text-text-hint transition-colors"
              />
            </div>

            {/* Pay day */}
            <div className="flex flex-col gap-1.5">
              <span className="text-text-hint text-[10px] font-medium uppercase tracking-[1.2px]">
                Ngày thanh toán hằng tháng
              </span>
              <DayOfMonthPicker value={form.payDay} onChange={form.setPayDay} />
              <p className="text-text-hint text-[10px]">
                Tháng ngắn hơn sẽ dùng ngày cuối tháng
              </p>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <span className="text-text-hint text-[10px] font-medium uppercase tracking-[1.2px]">
                Danh mục
              </span>
              <CategoryGrid
                categories={categories}
                selectedId={form.categoryId ?? null}
                onSelect={(id) => form.setCategoryId(id)}
                showAdd
                scrollable={false}
              />
            </div>



            {/* Note */}
            <div className="flex flex-col gap-1.5">
              <span className="text-text-hint text-[10px] font-medium uppercase tracking-[1.2px]">
                Ghi chú
              </span>
              <input
                type="text"
                value={form.note}
                onChange={(e) => form.setNote(e.target.value)}
                placeholder="Ghi chú thêm..."
                maxLength={100}
                className="border-border rounded-xl border bg-white px-4 py-3 text-[14px] outline-none focus:border-accent placeholder:text-text-hint transition-colors"
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-medium">Trạng thái</p>
                <p className="text-text-muted text-[11px]">
                  {form.active ? "Đang bật" : "Đã tắt"}
                </p>
              </div>
              <Switch
                checked={form.active}
                onCheckedChange={(v) => form.setActive(v)}
                aria-label={form.active ? "Tắt" : "Bật"}
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
  );
}
