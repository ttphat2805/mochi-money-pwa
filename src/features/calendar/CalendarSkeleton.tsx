export function CalendarSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Calendar Grid Skeleton */}
      <div className="px-4 mt-1">
        <div className="glass rounded-[24px] p-3">
          <div className="grid grid-cols-7 gap-1.5">
            {/* Weekdays header */}
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={`head-${i}`} className="h-4 rounded bg-white/5 mx-2 mb-2" />
            ))}
            {/* Day cells (35 total) */}
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={`cell-${i}`} className="h-[56px] bg-white/5 rounded-[14px]" />
            ))}
          </div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="mt-4 px-4 flex gap-2.5">
        <div className="glass h-[104px] flex-1 rounded-[20px]" />
        <div className="glass h-[104px] flex-1 rounded-[20px]" />
        <div className="glass h-[104px] flex-1 rounded-[20px]" />
      </div>
    </div>
  )
}
