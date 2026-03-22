export function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      style={{
        minWidth: 44, minHeight: 44,
        padding: '0 12px 0 6px',
        borderRadius: 12,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        WebkitTapHighlightColor: 'transparent',
      }}
      onTouchStart={e => e.currentTarget.style.background = '#F2F0EC'}
      onTouchEnd={e => e.currentTarget.style.background = 'transparent'}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M12.5 5 L7.5 10 L12.5 15"
          stroke="#1A1A18" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}
