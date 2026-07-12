import { X } from 'lucide-react'
import { triggerHaptic } from '@/lib/haptic'
import { closeButtonClass, cn } from '@/lib/utils'

interface CloseButtonProps {
  onClick: () => void
  /** Accessible label — defaults to "Đóng" */
  label?: string
  size?: 'sm' | 'md'
  className?: string
}

export function CloseButton({
  onClick,
  label = 'Đóng',
  size = 'md',
  className,
}: CloseButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        triggerHaptic('light')
        onClick()
      }}
      className={cn(closeButtonClass, size === 'md' ? 'size-8' : 'size-7', className)}
    >
      <X size={size === 'md' ? 14 : 12} strokeWidth={2.5} />
    </button>
  )
}
