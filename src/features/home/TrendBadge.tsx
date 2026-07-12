import { triggerHaptic } from '@/lib/haptic'
import { formatVND } from '@/lib/utils'
import { useAppStore } from '@/stores/appStore'
import { motion } from 'framer-motion'
import { ChevronRight, TrendingDown, TrendingUp } from 'lucide-react'

interface TrendBadgeProps {
  monthSpent: number
  lastMonthSpent: number
  onClick: () => void
}

export function TrendBadge({ monthSpent, lastMonthSpent, onClick }: TrendBadgeProps) {
  const { setDashboardChartMode } = useAppStore()

  if (lastMonthSpent === 0) return null

  const diff = monthSpent - lastMonthSpent
  const isIncrease = diff > 0
  
  const handleClick = () => {
    triggerHaptic('light')
    setDashboardChartMode('trend')
    onClick()
  }

  return (
    <div className="px-4">
      <motion.button
        type="button"
        onClick={handleClick}
        whileTap={{ scale: 0.98 }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          borderRadius: 18,
          background: 'var(--color-card)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Icon circle */}
        <div
          className="size-[38px] rounded-2xl flex items-center justify-center shrink-0"
          style={{
            background: isIncrease
              ? 'var(--color-danger-bg)'
              : 'var(--color-success-bg)',
          }}
        >
          {isIncrease
            ? <TrendingUp size={18} style={{ color: '#EF4444' }} />
            : <TrendingDown size={18} style={{ color: 'var(--color-success)' }} />
          }
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-[13px] leading-tight" style={{ color: 'var(--color-text-muted)' }}>
            {isIncrease ? 'Tháng này bạn chi thêm ' : 'Bạn đã tiết kiệm được '}
            <span
              className="font-bold font-num inline-flex items-center gap-0.5"
              style={{ color: isIncrease ? '#EF4444' : 'var(--color-success)' }}
            >
              {formatVND(Math.abs(diff))}đ
            </span>
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-hint)' }}>so với cùng kỳ tháng trước · nhấn để xem</p>
        </div>

        <ChevronRight size={16} style={{ color: 'var(--color-text-hint)' }} className="shrink-0" />
      </motion.button>
    </div>
  )
}
