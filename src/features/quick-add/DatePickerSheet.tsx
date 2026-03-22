import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  useDatePicker,
  WEEKDAY_LABELS,
  formatDateLabel,
} from "@/hooks/useDatePicker";
import type { DateShortcut } from "@/hooks/useDatePicker";

interface DatePickerSheetProps {
  open: boolean;
  onClose: () => void;
  /** Called with 'YYYY-MM-DD'. Parent is responsible for closing via setDatePickerOpen(false). */
  onConfirm: (date: string) => void;
  initialDate?: string;
}

const SHORTCUTS: { key: DateShortcut; label: string }[] = [
  { key: "yesterday", label: "Hôm qua" },
  { key: "today", label: "Hôm nay" },
  { key: "2days", label: "2 ngày trước" },
  { key: "custom", label: "Tuỳ chọn ›" },
];

/**
 * Custom date picker overlay — does NOT use Radix Sheet.
 * Using a Radix Dialog/Sheet here would cause the parent QuickAddSheet
 * to close when this one closes (Radix DismissableLayer cross-portal events).
 * Instead this is a plain fixed overlay that slides in from the bottom.
 */
export function DatePickerSheet({
  open,
  onClose,
  onConfirm,
  initialDate,
}: DatePickerSheetProps) {
  const picker = useDatePicker(initialDate);
  const [mounted, setMounted] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 40) {
      picker.nextMonth();
    } else if (diff < -40) {
      picker.prevMonth();
    }
    setTouchStartX(null);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset picker state whenever the overlay opens
  useEffect(() => {
    if (open) {
      picker.reset(initialDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialDate]);

  const handleConfirm = () => {
    const date = picker.confirm();
    onConfirm(date); // parent updates its date state
    // parent also calls setDatePickerOpen(false) inside onConfirm
    // so we don't call onClose() here to avoid double-firing
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop — tap to dismiss */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-60 bg-black/20 transition-opacity duration-200"
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
        aria-hidden="true"
      />

      {/* Panel — slides up from bottom */}
      <div
        className="bg-bg fixed inset-x-0 bottom-0 z-70 w-full max-w-[480px] mx-auto rounded-t-2xl shadow-xl transition-transform duration-300 ease-out"
        style={{
          transform: open ? "translateY(0)" : "translateY(100%)",
          paddingBottom: "env(safe-area-inset-bottom)",
          pointerEvents: open ? "auto" : "none",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Chọn ngày"
      >
        {/* Drag handle & Close button */}
        <div className="relative flex justify-center pt-2.5 pb-3">
          <div className="bg-border2 h-1 w-10 rounded-full" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-2 flex size-8 items-center justify-center rounded-full bg-surface active:bg-surface2 transition-colors"
            aria-label="Đóng"
          >
            <X className="size-4 text-text-muted" />
          </button>
        </div>

        <div className="flex flex-col gap-3 px-4">
          {/* Quick shortcut chips */}
          <div 
            className="flex gap-2 overflow-x-auto pb-1.5 pt-1 -mx-4 px-4 scrollbar-hide touch-pan-x snap-x"
            onTouchMove={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            {SHORTCUTS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => picker.selectShortcut(s.key)}
                className={`snap-center shrink-0 h-9 rounded-full border-[1.5px] px-4 text-[13px] font-medium transition-all ${
                  picker.activeShortcut === s.key
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-white text-text-muted active:bg-surface"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Selected date display box */}
          <div className="rounded-xl border border-accent/20 bg-accent-bg px-4 py-3">
            <span className="text-text-muted text-[11px] font-medium uppercase tracking-[1px]">
              Ngày đã chọn
            </span>
            <p className="text-accent-dark mt-0.5 text-[14px] font-semibold">
              {formatDateLabel(picker.selectedDate)}
            </p>
          </div>

          {/* Calendar grid — animated expand */}
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: picker.showCalendar ? "380px" : "0px",
              opacity: picker.showCalendar ? 1 : 0,
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Month navigation */}
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={picker.prevMonth}
                className="bg-surface active:bg-surface2 flex size-8 items-center justify-center rounded-full transition-colors"
                aria-label="Tháng trước"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-sm font-semibold">{picker.monthLabel}</span>
              <button
                type="button"
                onClick={picker.nextMonth}
                className="bg-surface active:bg-surface2 flex size-8 items-center justify-center rounded-full transition-colors"
                aria-label="Tháng sau"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            {/* Weekday headers — T7/CN in amber */}
            <div className="mb-1 grid grid-cols-7">
              {WEEKDAY_LABELS.map((label, i) => (
                <div
                  key={label}
                  className={`text-center text-[11px] font-medium ${
                    i >= 5 ? "text-accent" : "text-text-muted"
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="flex flex-col gap-0.5">
              {picker.dayGrid.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7">
                  {week.map((cell) => (
                    <button
                      key={cell.date}
                      type="button"
                      disabled={!cell.isCurrentMonth}
                      onClick={() => picker.selectDay(cell.date)}
                      className={`relative mx-auto flex aspect-square w-full max-w-[40px] items-center justify-center rounded-full text-[13px] transition-colors ${
                        cell.isSelected
                          ? "bg-accent font-semibold text-white"
                          : cell.isToday && cell.isCurrentMonth
                            ? "font-semibold text-accent active:bg-surface"
                            : !cell.isCurrentMonth
                                ? "pointer-events-none text-text-hint opacity-30"
                                : "text-text active:bg-surface"
                      }`}
                    >
                      {cell.day}
                      {/* Today amber dot */}
                      {cell.isToday &&
                        cell.isCurrentMonth &&
                        !cell.isSelected && (
                          <span className="bg-accent absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full" />
                        )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Confirm button */}
          <button
            type="button"
            onClick={handleConfirm}
            className="bg-text mb-4 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] text-white transition-opacity active:opacity-80"
          >
            <span className="text-sm font-semibold">Xác nhận</span>
            <span className="text-[11px] text-white/50">
              {formatDateLabel(picker.selectedDate).split(" · ")[0]}
            </span>
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
