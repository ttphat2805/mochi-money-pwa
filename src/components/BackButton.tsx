import { triggerHaptic } from '@/lib/haptic'

export function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={() => {
        triggerHaptic('light')
        onBack()
      }}
      className="flex items-center gap-1 bg-transparent border-none cursor-pointer rounded-xl transition-all duration-200 active:scale-[0.92] active:bg-surface2 text-text font-medium"
      style={{
        minWidth: 44, minHeight: 44,
        padding: '0 12px 0 6px',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
        <path d="M12.5 5 L7.5 10 L12.5 15"
          stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}
