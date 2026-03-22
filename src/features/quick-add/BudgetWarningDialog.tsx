import { formatVND } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

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
      <DialogContent showCloseButton={true}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{warning.category.icon}</span>
            <span>Vượt hạn mức</span>
          </DialogTitle>
          <DialogDescription>
            Danh mục <strong>{warning.category.name}</strong> đã chi{' '}
            <strong className="text-danger">{formatVND(warning.currentSpent)}đ</strong>{' '}
            / {formatVND(warning.limit)}đ.
            <br />
            Thêm {formatVND(warning.newAmount)}đ sẽ vượt{' '}
            <strong className="text-danger">{formatVND(overBy)}đ</strong>.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Bỏ qua
          </Button>
          <Button
            onClick={onConfirm}
            variant="default"
            className="flex-1"
          >
            Vẫn thêm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
