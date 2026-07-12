import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, TrendingUp, TrendingDown, Info, ChevronRight } from 'lucide-react'
import { useFinancialInsights, type FinancialInsight } from '@/hooks/useFinancialInsights'
import { triggerHaptic } from '@/lib/haptic'

export function InsightSection() {
  const { insights, isLoading } = useFinancialInsights()

  if (isLoading || !insights || insights.length === 0) return null

  return (
    <div className="px-4 mt-8">
      <div className="flex items-center gap-2 mb-4 px-1">
          <div className="size-5 rounded-full bg-accent/10 flex items-center justify-center">
            <Sparkles size={11} className="text-accent" />
          </div>
          <h3 className="text-[12px] font-bold text-text uppercase tracking-[1.5px]">Phân tích thông minh</h3>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x scrollbar-hide">
        <AnimatePresence>
          {insights.map((insight, idx) => (
            <InsightCard key={idx} insight={insight} index={idx} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function InsightCard({ insight, index }: { insight: FinancialInsight, index: number }) {
  const isPositive = insight.type === 'positive'
  const isNegative = insight.type === 'negative'

  const styles = {
    positive: {
      bg: 'bg-emerald-400/10',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-400/15',
      label: 'Tiểu điểm tốt'
    },
    negative: {
      bg: 'bg-red-400/10',
      iconColor: 'text-red-400',
      iconBg: 'bg-red-400/15',
      label: 'Cần lưu ý'
    },
    neutral: {
      bg: 'bg-card',
      iconColor: 'text-text-muted',
      iconBg: 'bg-surface2',
      label: 'Thông tin'
    }
  }

  const { bg, iconColor, iconBg, label } = styles[insight.type]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.98 }}
      onClick={() => triggerHaptic('light')}
      className={`snap-start shrink-0 w-[280px] p-5 rounded-[28px] ${bg} shadow-premium border border-border flex flex-col gap-4 relative overflow-hidden`}
    >
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
            <div className={`size-8 rounded-xl ${iconBg} flex items-center justify-center`}>
              {isPositive ? <TrendingDown size={16} className={iconColor} /> : 
               isNegative ? <TrendingUp size={16} className={iconColor} /> : 
               <Info size={16} className={iconColor} />}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${iconColor}`}>
              {label}
            </span>
        </div>
      </div>

      <div className="relative z-10">
        <h4 className="text-[16px] font-bold text-text mb-1.5 leading-tight">
            {insight.title}
        </h4>
        <p className="text-[13px] text-text-muted leading-relaxed font-medium">
          {insight.message}
        </p>
      </div>

      <div className="mt-auto pt-1 flex items-center text-[11px] font-bold text-text-hint uppercase tracking-[1px] group relative z-10">
        Xem chi tiết <ChevronRight size={12} className="ml-1 transition-transform group-active:translate-x-1" />
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
    </motion.div>
  )
}

