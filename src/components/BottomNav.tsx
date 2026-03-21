import { Home, RefreshCw, CalendarDays, BarChart2, Plus } from 'lucide-react'
import { useQuickAddStore } from '@/stores/quickAddStore'

export type TabKey = 'home' | 'today' | 'calendar' | 'overview'

interface BottomNavProps {
  active: TabKey
  onTab: (tab: TabKey) => void
}

interface NavItemProps {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 transition-colors"
    >
      <span style={{ color: active ? '#E8A020' : '#B8B8A8' }}>{icon}</span>
      <span
        className="text-[10px] font-medium leading-none"
        style={{ color: active ? '#E8A020' : '#B8B8A8' }}
      >
        {label}
      </span>
    </button>
  )
}

export function BottomNav({ active, onTab }: BottomNavProps) {
  const openQuickAdd = useQuickAddStore((s) => s.open)

  return (
    <div className="relative" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* ── Floating center FAB ─────────────────────────── */}
      <div className="absolute left-1/2 -translate-x-1/2 z-20" style={{ top: '-28px' }}>
        <button
          type="button"
          onClick={openQuickAdd}
          aria-label="Thêm chi tiêu"
          className="flex size-14 items-center justify-center rounded-full transition-transform active:scale-95"
          style={{
            backgroundColor: '#E8A020',
            boxShadow: '0 4px 20px rgba(232, 160, 32, 0.45)',
          }}
        >
          <Plus size={26} color="white" strokeWidth={2.5} />
        </button>
      </div>

      {/* ── Nav surface with SVG cutout top-border ──── */}
      <div className="relative bg-white" style={{ height: 60 }}>
        {/* SVG cutout: white fill + border line with arch at center */}
        <svg
          className="absolute inset-0 w-full pointer-events-none"
          height="60"
          preserveAspectRatio="none"
          viewBox="0 0 375 60"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* White fill with arch cutout */}
          <path
            d="M0,0 L153,0 C163,0 167,2 171,7 C175,13 176,22 187.5,28 C199,22 200,13 204,7 C208,2 212,0 222,0 L375,0 L375,60 L0,60 Z"
            fill="white"
          />
          {/* Top border line with matching arch */}
          <path
            d="M0,0.5 L153,0.5 C163,0.5 167,2.5 171,7.5 C175,13.5 176,22.5 187.5,28.5 C199,22.5 200,13.5 204,7.5 C208,2.5 212,0.5 222,0.5 L375,0.5"
            fill="none"
            stroke="#E2E0D8"
            strokeWidth="1"
          />
        </svg>

        {/* Nav items */}
        <div className="relative z-10 flex h-full w-full items-center">
          {/* Left 2 */}
          <NavItem
            icon={<Home size={22} />}
            label="Trang chủ"
            active={active === 'home'}
            onClick={() => onTab('home')}
          />
          <NavItem
            icon={<RefreshCw size={22} />}
            label="Hôm nay"
            active={active === 'today'}
            onClick={() => onTab('today')}
          />

          {/* Center spacer — matches FAB width */}
          <div className="w-14 shrink-0" />

          {/* Right 2 */}
          <NavItem
            icon={<CalendarDays size={22} />}
            label="Lịch"
            active={active === 'calendar'}
            onClick={() => onTab('calendar')}
          />
          <NavItem
            icon={<BarChart2 size={22} />}
            label="Tổng quan"
            active={active === 'overview'}
            onClick={() => onTab('overview')}
          />
        </div>
      </div>
    </div>
  )
}
