import { Trash2, AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  variant?: 'delete' | 'warning'
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  variant = 'delete',
  title,
  description,
  confirmLabel = 'Xoá',
  cancelLabel = 'Huỷ',
  loading = false,
}: ConfirmDialogProps) {
  const isDelete = variant === 'delete'

  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[320px] rounded-[20px] bg-white p-0 shadow-xl"
      >
        {/* Body */}
        <div className="flex flex-col items-center px-6 pt-7 pb-6 gap-3">
          {/* Icon circle */}
          <div
            className="flex size-14 items-center justify-center rounded-full shrink-0"
            style={{
              backgroundColor: isDelete ? '#FFF0F0' : '#FFF4E0',
            }}
          >
            {isDelete ? (
              <Trash2 size={24} color="#D63E3E" strokeWidth={2} />
            ) : (
              <AlertTriangle size={24} color="#E8A020" strokeWidth={2} />
            )}
          </div>

          {/* Text */}
          <div className="text-center">
            <DialogTitle className="text-[16px] font-semibold text-text leading-snug">{title}</DialogTitle>
            {description ? (
              <DialogDescription className="mt-1.5 text-[13px] text-text-muted leading-relaxed">
                {description}
              </DialogDescription>
            ) : (
              <DialogDescription className="sr-only">Xác nhận hành động này</DialogDescription>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-2 flex w-full gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex h-11 flex-1 items-center justify-center rounded-[12px] bg-surface text-[14px] font-medium text-text-muted transition-colors active:bg-surface2 disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="flex h-11 flex-1 items-center justify-center rounded-[12px] text-[14px] font-semibold text-white transition-all active:scale-[0.97] disabled:opacity-50"
              style={{ backgroundColor: isDelete ? '#D63E3E' : '#E8A020' }}
            >
              {loading ? '...' : confirmLabel}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
