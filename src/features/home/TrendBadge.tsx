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
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 4px 20px rgba(99,102,241,0.1), 0 1px 4px rgba(0,0,0,0.04)',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Icon circle */}
        <div
          className="size-[38px] rounded-2xl flex items-center justify-center shrink-0"
          style={{
            background: isIncrease
              ? 'linear-gradient(135deg,#FEE2E2,#FECACA)'
              : 'linear-gradient(135deg,#D1FAE5,#A7F3D0)',
          }}
        >
          {isIncrease
            ? <TrendingUp size={18} style={{ color: '#EF4444' }} />
            : <TrendingDown size={18} style={{ color: '#10B981' }} />
          }
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-[13px] leading-tight" style={{ color: '#6B7280' }}>
            {isIncrease ? 'Tháng này bạn chi thêm ' : 'Bạn đã tiết kiệm được '}
            <span
              className="font-bold font-num inline-flex items-center gap-0.5"
              style={{ color: isIncrease ? '#EF4444' : '#10B981' }}
            >
              {formatVND(Math.abs(diff))}đ
            </span>
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: '#9CA3AF' }}>so với cùng kỳ tháng trước · nhấn để xem</p>
        </div>
        
        <ChevronRight size={16} style={{ color: '#9CA3AF' }} className="shrink-0" />
      </motion.button>
    </div>
  )
}
