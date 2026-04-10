export function BudgetSkeleton() {
  return (
    <div className="flex-1 px-4 py-4 scrollbar-hide pb-32 pt-2 animate-pulse min-h-full">
      {/* Gauge Card Skeleton */}
      <div className="mb-4 bg-surface2 rounded-2xl h-[330px] w-full" />

      {/* Category List Header */}
      <div className="px-1 mb-2 h-4 w-24 bg-surface2 rounded" />

      {/* Category Items Skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-4 p-5 bg-surface2 rounded-[32px] h-[160px] w-full" />
      ))}
    </div>
  )
}
