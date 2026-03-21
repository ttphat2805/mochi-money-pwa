import { Plus } from 'lucide-react'

interface FABProps {
  onClick: () => void
}

export function FAB({ onClick }: FABProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-text fixed right-5 z-50 flex size-14 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95"
      style={{ bottom: 'calc(76px + env(safe-area-inset-bottom))' }}
      aria-label="Thêm chi tiêu"
    >
      <Plus className="size-7 text-white" strokeWidth={2.5} />
    </button>
  )
}
