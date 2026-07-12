import { Plus } from 'lucide-react'
import { triggerHaptic } from '@/lib/haptic'

interface FABProps {
  onClick: () => void
}

export function FAB({ onClick }: FABProps) {
  return (
    <button
      type="button"
      onClick={() => {
        triggerHaptic('medium')
        onClick()
      }}
      className="bg-accent fixed right-5 z-50 flex size-14 items-center justify-center rounded-full text-white"
      style={{
        bottom: 'calc(76px + env(safe-area-inset-bottom))',
        boxShadow: `0 6px 24px rgba(var(--color-accent-rgb), 0.4)`,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
      onTouchStart={e => {
        e.currentTarget.style.transform = 'scale(0.92)'
        e.currentTarget.style.boxShadow = `0 2px 8px rgba(var(--color-accent-rgb), 0.45)`
      }}
      onTouchEnd={e => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = `0 6px 24px rgba(var(--color-accent-rgb), 0.4)`
      }}
      aria-label="Thêm chi tiêu"
    >
      <Plus className="size-7 text-white" strokeWidth={2.5} />
    </button>
  )
}
