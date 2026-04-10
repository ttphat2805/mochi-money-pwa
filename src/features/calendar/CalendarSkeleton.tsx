export function CalendarSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Calendar Grid Skeleton */}
      <div className="grid grid-cols-7 gap-1 px-4 mt-2">
        {/* Weekdays header */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={`head-${i}`} className="h-4 rounded bg-surface2 mx-2 mb-2" />
        ))}
        {/* Day cells (35 total) */}
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={`cell-${i}`} className="aspect-square bg-surface2 rounded-xl" />
        ))}
      </div>

      {/* Stats Skeleton */}
      <div className="mt-4 px-4 flex gap-2">
        <div className="h-[72px] bg-surface2 flex-1 rounded-2xl" />
        <div className="h-[72px] bg-surface2 flex-1 rounded-2xl" />
      </div>

      {/* Day Panel Skeleton */}
      <div className="mt-4 px-4 space-y-3">
        <div className="h-6 w-32 bg-surface2 rounded mb-2" />
        <div className="h-16 w-full bg-surface2 rounded-xl" />
        <div className="h-16 w-full bg-surface2 rounded-xl" />
      </div>
    </div>
  )
}
