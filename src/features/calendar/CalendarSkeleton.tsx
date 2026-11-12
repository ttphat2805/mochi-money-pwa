import { cn } from '@/lib/utils'

const WEEKDAY_HEADERS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

interface CalendarSkeletonProps {
  /** Week rows of the month being loaded (5 or 6) — matches the real grid height */
  weeks: number
  /**
   * When false the skeleton still reserves the exact layout but is invisible —
   * used during the short delay before a skeleton is worth showing, so neither
   * a flash of skeleton nor a false "empty month" is rendered.
   */
  visible: boolean
}

/**
 * Mirrors the real CalendarGrid + MonthSummary markup (same paddings, same
 * static text rows, invisible placeholder text) so swapping in the real
 * content causes no layout shift.
 */
export function CalendarSkeleton({ weeks, visible }: CalendarSkeletonProps) {
  return (
    <div
      aria-busy
      aria-label="Đang tải lịch"
      className={cn('flex flex-col gap-4', visible ? 'animate-pulse' : 'opacity-0')}
    >
      {/* ── Grid ── */}
      <div className="px-4">
        <div className="glass rounded-[24px] p-3">
          <div className="grid grid-cols-7 mb-2" aria-hidden>
            {WEEKDAY_HEADERS.map((h) => (
              <div
                key={h}
                className="text-center text-[10px] font-bold tracking-wider py-1 opacity-80 text-text-hint"
              >
                {h}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: weeks * 7 }, (_, i) => (
              <div key={i} className="h-[56px] bg-surface2/50 rounded-[14px]" />
            ))}
          </div>

          {/* Legend row placeholder — same text metrics as the real legend */}
          <div className="flex items-center justify-end gap-1.5 mt-3 pr-1 invisible" aria-hidden>
            <span className="text-[9px] font-medium">Ít</span>
            <span className="size-2.5" />
          </div>
        </div>
      </div>

      {/* ── Month summary ── */}
      <div className="px-4" aria-hidden>
        <p className="section-title mb-2.5 px-1">Tổng kết tháng</p>
        <div className="grid grid-cols-3 gap-2.5">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="glass rounded-[20px] p-3.5 flex flex-col gap-2.5">
              <div className="size-8 rounded-[10px] bg-surface2/60" />
              <p className="text-[10px] font-bold leading-none invisible">0</p>
              <div className="invisible">
                <p className="font-num text-[17px] font-black leading-none">0</p>
                <p className="text-[9.5px] mt-1 font-semibold">0</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
