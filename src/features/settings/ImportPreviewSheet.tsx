import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import type { BackupSummary } from '@/lib/backup'

function SummaryRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-text-muted">{label}</span>
      <span className="text-[12px] font-semibold text-text font-mono">{value}</span>
    </div>
  )
}

interface ImportPreviewSheetProps {
  open: boolean
  summary: BackupSummary | null
  isRestoring: boolean
  onClose: () => void
  onReplace: () => void
  onMerge: () => void
}

export function ImportPreviewSheet({
  open,
  summary,
  isRestoring,
  onClose,
  onReplace,
  onMerge,
}: ImportPreviewSheetProps) {
  if (!summary) return null

  const exportDate = new Date(summary.exportedAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        showCloseButton={true}
        className="rounded-t-3xl bg-white p-0"
        style={{ maxHeight: '85dvh' }}
      >
        <SheetTitle className="sr-only">Nhập dữ liệu</SheetTitle>
        <SheetDescription className="sr-only">Xem trước dữ liệu backup</SheetDescription>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-0">
          <div className="w-9 h-1 rounded-full bg-surface2" />
        </div>

        <div className="px-5 py-5 flex flex-col gap-5">
          {/* Icon + heading */}
          <div className="flex flex-col items-center gap-2">
            <div className="size-16 rounded-2xl bg-accent-bg flex items-center justify-center text-[32px] leading-none">
              📥
            </div>
            <h3 className="text-[16px] font-semibold text-text">Nhập dữ liệu</h3>
            <p className="text-[11px] text-text-muted">Backup từ {exportDate}</p>
          </div>

          {/* Summary card */}
          <div className="bg-surface rounded-2xl px-4 py-3 flex flex-col gap-3">
            <SummaryRow label="Giao dịch" value={`${summary.transactionCount} khoản`} />
            <div className="h-px bg-border" />
            <SummaryRow label="Danh mục" value={`${summary.categoryCount} mục`} />
            <div className="h-px bg-border" />
            <SummaryRow label="Khoản lặp lại" value={`${summary.recurringCount} mục`} />
            <div className="h-px bg-border" />
            <SummaryRow label="Khoảng thời gian" value={summary.monthRange} />
          </div>

          {/* Mode description */}
          <p className="text-[12px] text-text-muted text-center">
            Chọn cách nhập — <strong>Gộp</strong> giữ dữ liệu cũ, <strong>Thay thế</strong> xoá sạch trước
          </p>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            {/* Merge — safe, primary */}
            <button
              type="button"
              onClick={onMerge}
              disabled={isRestoring}
              className="h-12 w-full rounded-xl bg-text text-white text-[14px] font-semibold disabled:opacity-40 transition-all active:scale-[0.98]"
            >
              {isRestoring ? 'Đang nhập...' : 'Gộp vào dữ liệu hiện tại'}
            </button>

            {/* Replace — destructive */}
            <button
              type="button"
              onClick={onReplace}
              disabled={isRestoring}
              className="h-12 w-full rounded-xl border border-[#FFC5C5] text-[14px] font-medium text-danger disabled:opacity-40 transition-colors active:bg-danger-bg"
            >
              Thay thế toàn bộ (xoá dữ liệu cũ)
            </button>

            {/* Cancel */}
            <button
              type="button"
              onClick={onClose}
              disabled={isRestoring}
              className="h-10 w-full text-[13px] text-text-muted"
            >
              Huỷ
            </button>
          </div>

          <div className="safe-bottom h-0" />
        </div>
      </SheetContent>
    </Sheet>
  )
}
