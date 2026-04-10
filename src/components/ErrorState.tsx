interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  message = 'Có lỗi xảy ra',
  onRetry,
}: ErrorStateProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyItems: 'center',
      padding: '48px 24px', textAlign: 'center',
    }}>
      <span style={{ fontSize: 40, marginBottom: 16 }}>😵</span>
      <p style={{ fontSize: 15, fontWeight: 500, color: '#1A1A18', marginBottom: 6 }}>
        {message}
      </p>
      <p style={{ fontSize: 13, color: '#88887A', marginBottom: 20 }}>
        Thử lại hoặc khởi động lại app
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '10px 24px', borderRadius: 12,
            background: 'var(--color-accent)', color: 'white',
            border: 'none', fontSize: 14, fontWeight: 600,
            cursor: 'pointer',
          }}
          className="active-scale"
        >
          Thử lại
        </button>
      )}
    </div>
  )
}
