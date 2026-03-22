import { formatVND } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'

interface BudgetWarning {
  category: {
    name: string
    icon: string
    limitPerMonth: number | null
  }
  currentSpent: number
  limit: number
  newAmount: number
}

interface BudgetWarningDialogProps {
  warning: BudgetWarning | null
  onConfirm: () => void
  onCancel: () => void
}

export function BudgetWarningDialog({
  warning,
  onConfirm,
  onCancel,
}: BudgetWarningDialogProps) {
  if (!warning) return null

  const overBy = warning.currentSpent + warning.newAmount - warning.limit

  return (
    <Dialog open={!!warning} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent showCloseButton={true} className="p-0 overflow-hidden border-none shadow-premium rounded-[32px] bg-white/95 backdrop-blur-md">
        <div className="flex flex-col items-center p-6 gap-4">
          {/* Icon Header */}
          <div className="size-14 rounded-full bg-danger/10 flex items-center justify-center text-2xl shadow-inner">
            {warning.category.icon}
          </div>
          
          <div className="text-center">
            <h2 className="text-[17px] font-bold text-text mb-1.5 leading-tight">Vượt hạn mức chi tiêu</h2>
            <p className="text-[13px] text-text-muted leading-relaxed px-2">
              Bạn đã chi <span className="font-bold text-danger">{formatVND(warning.currentSpent)}đ</span> trong danh mục <strong>{warning.category.name}</strong>. 
              Thêm giao dịch này sẽ vượt hạn mức <span className="font-bold text-danger">{formatVND(overBy)}đ</span>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full mt-2">
            <button
              onClick={onCancel}
              className="h-12 flex items-center justify-center rounded-2xl bg-surface2/50 text-[14px] font-bold text-text-muted active-scale border border-white"
            >
              Bỏ qua
            </button>
            <button
              onClick={onConfirm}
              className="h-12 flex items-center justify-center rounded-2xl bg-danger text-[14px] font-black text-white active-scale shadow-sm btn-premium"
            >
              Vẫn thêm
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
