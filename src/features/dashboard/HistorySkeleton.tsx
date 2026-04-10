export function HistorySkeleton() {
  return (
    <div className="flex flex-col pb-32 animate-pulse mt-4 px-4 gap-4 w-full">
      {/* Month nav row */}
      <div className="flex items-center justify-between mb-2">
        <div className="h-8 w-8 rounded-full bg-surface2" />
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-24 bg-surface2 rounded" />
          <div className="h-4 w-32 bg-surface2 rounded" />
        </div>
        <div className="h-8 w-8 rounded-full bg-surface2" />
      </div>

      {/* Date header */}
      <div className="flex justify-between items-center mb-1">
        <div className="h-4 w-16 bg-surface2 rounded" />
        <div className="h-4 w-20 bg-surface2 rounded" />
      </div>

      {/* 5 Transaction rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex min-h-[52px] items-center gap-3">
          <div className="h-9 w-9 rounded-[11px] bg-surface2 shrink-0" />
          <div className="flex flex-col gap-1.5 flex-1 p-1">
            <div className="h-4 w-24 bg-surface2 rounded" />
            <div className="h-3 w-32 bg-surface2 rounded" />
          </div>
          <div className="h-4 w-16 bg-surface2 rounded" />
        </div>
      ))}
    </div>
  )
}
