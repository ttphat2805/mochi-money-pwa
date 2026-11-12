import { toast } from 'sonner'
import { db } from '@/lib/db'
import { formatVND } from '@/lib/utils'

const UNDO_WINDOW_MS = 5000

/**
 * Soft-delete a transaction and show the "Hoàn tác" toast.
 * Single home for the delete + undo flow (detail sheet, swipe-to-delete).
 * Returns false if the delete itself failed (an error toast is shown).
 */
export async function softDeleteWithUndo(
  tx: { id: number; amount: number },
  onRestored?: () => void,
): Promise<boolean> {
  try {
    await db.transactions.update(tx.id, { deletedAt: new Date().toISOString() })
  } catch (err) {
    console.error('softDeleteWithUndo: delete failed', err)
    toast.error('Không thể xoá giao dịch. Vui lòng thử lại.')
    return false
  }

  toast('Đã xoá giao dịch · ' + formatVND(tx.amount) + 'đ', {
    action: {
      label: 'Hoàn tác',
      onClick: async () => {
        try {
          await db.transactions.update(tx.id, { deletedAt: null })
          toast.success('Đã khôi phục')
          onRestored?.()
        } catch (err) {
          console.error('softDeleteWithUndo: restore failed', err)
          toast.error('Không thể khôi phục giao dịch')
        }
      },
    },
    duration: UNDO_WINDOW_MS,
  })
  return true
}
