export function OverviewSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide pb-32 animate-pulse mt-2">
      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`stat-${i}`} className="bg-surface2 rounded-[22px] h-[88px]" />
        ))}
      </div>

      {/* Bar Chart Skeleton */}
      <div className="mb-6">
        <div className="h-4 w-32 bg-surface2 rounded mb-3" />
        <div className="bg-surface2 rounded-[24px] h-[180px] w-full" />
      </div>

      {/* Donut Chart Skeleton */}
      <div>
        <div className="bg-surface2 rounded-[24px] h-[220px] w-full" />
      </div>
    </div>
  )
}
