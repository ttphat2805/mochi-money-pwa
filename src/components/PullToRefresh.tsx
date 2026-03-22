import { useState, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'

export function PullToRefresh({ onRefresh, children }: { onRefresh: () => Promise<void>; children: React.ReactNode }) {
  const [pullProgress, setPullProgress] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const isPulling = useRef(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      if (el.scrollTop === 0) {
        startY.current = e.touches[0].clientY
        isPulling.current = true
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || refreshing) return
      
      const currentY = e.touches[0].clientY
      const dy = currentY - startY.current
      
      if (dy > 0 && el.scrollTop === 0) {
        // Prevent default scrolling only when pulling from the very top
        // This stops the browser's default overscroll refresh behavior if needed
        if (e.cancelable) e.preventDefault()
        setPullProgress(Math.min(dy / 120, 1))
      }
    }

    const onTouchEnd = async () => {
      if (!isPulling.current) return
      isPulling.current = false
      
      if (pullProgress > 0.8 && !refreshing) {
        setRefreshing(true)
        try {
          await onRefresh()
        } finally {
          setRefreshing(false)
          setPullProgress(0)
        }
      } else {
        setPullProgress(0)
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [pullProgress, refreshing, onRefresh])

  return (
    <div ref={containerRef} className="h-full w-full overflow-y-auto relative">
      <div 
        className="absolute top-0 left-0 w-full flex justify-center text-text-hint overflow-hidden transition-all duration-200 z-50 pointer-events-none"
        style={{ 
          height: refreshing ? 60 : 0, 
          paddingTop: refreshing ? 20 : 0,
          opacity: refreshing || pullProgress > 0 ? 1 : 0
        }}
      >
        {refreshing ? (
          <Loader2 className="animate-spin size-6 text-accent" />
        ) : (
          <div 
            className="rounded-full bg-white shadow-md flex items-center justify-center border border-border"
            style={{ 
              width: 32, 
              height: 32, 
              transform: `scale(${Math.min(pullProgress, 1)}) rotate(${pullProgress * 180}deg)`,
              marginTop: pullProgress * 20
            }}
          >
            <Loader2 className="size-4 text-accent" />
          </div>
        )}
      </div>
      <div 
        className="min-h-full"
        style={{
          transform: `translateY(${!refreshing ? pullProgress * 60 : 60}px)`,
          transition: !isPulling.current ? 'transform 0.3s cubic-bezier(0.1, 0.8, 0.2, 1)' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  )
}
