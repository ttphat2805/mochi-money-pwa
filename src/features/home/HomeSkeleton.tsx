export function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-4 pb-4 pt-1 px-4 animate-pulse">
      {/* Hero Skeleton */}
      <div className="h-[200px] rounded-[32px] bg-surface2 w-full" />
      
      {/* Summary Row Skeleton */}
      <div className="flex gap-2">
        <div className="h-20 flex-1 rounded-2xl bg-surface2" />
        <div className="h-20 flex-1 rounded-2xl bg-surface2" />
        <div className="h-20 flex-1 rounded-2xl bg-surface2" />
      </div>

      {/* Suggestion / Warnings skeleton */}
      <div className="h-16 rounded-xl bg-surface2 w-full" />

      {/* Recurring Skeleton */}
      <div className="space-y-3 mt-2">
        <div className="h-14 rounded-2xl bg-surface2 w-full" />
        <div className="h-14 rounded-2xl bg-surface2 w-full" />
        <div className="h-14 rounded-2xl bg-surface2 w-full" />
      </div>

      {/* Recent list skeleton */}
      <div className="space-y-3 mt-4">
        <div className="h-[72px] rounded-2xl bg-surface2 w-full" />
        <div className="h-[72px] rounded-2xl bg-surface2 w-full" />
        <div className="h-[72px] rounded-2xl bg-surface2 w-full" />
      </div>
    </div>
  )
}
