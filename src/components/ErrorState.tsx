import { Frown } from 'lucide-react'

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
      <Frown size={40} style={{ color: 'var(--color-text-hint)', marginBottom: 16 }} />
      <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text)', marginBottom: 6 }}>
        {message}
      </p>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 20 }}>
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
