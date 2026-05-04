export function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-4 pb-4 pt-1 px-4 animate-pulse">
      {/* Hero Card Skeleton */}
      <div className="h-[220px] rounded-[28px] bg-surface2 w-full" />

      {/* Recurring Section Skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-32 rounded-full bg-surface2" />
        <div className="h-14 rounded-2xl bg-surface2 w-full" />
        <div className="h-14 rounded-2xl bg-surface2 w-full" />
      </div>

      {/* Recent Transactions Skeleton */}
      <div className="space-y-3 mt-1">
        <div className="flex justify-between items-center">
          <div className="h-3 w-20 rounded-full bg-surface2" />
          <div className="h-3 w-16 rounded-full bg-surface2" />
        </div>
        <div className="h-[64px] rounded-2xl bg-surface2 w-full" />
        <div className="h-[64px] rounded-2xl bg-surface2 w-full" />
        <div className="h-[64px] rounded-2xl bg-surface2 w-full" />
      </div>
    </div>
  )
}
