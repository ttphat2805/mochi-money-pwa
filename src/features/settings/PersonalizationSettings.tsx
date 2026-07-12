import { useState } from 'react'
import { usePersonalization } from '@/hooks/usePersonalization'
import { Check } from 'lucide-react'
import { cn, tint } from '@/lib/utils'

// Accent presets must stay legible as fills and tints on the dark navy
// background — bright/saturated tones only, no near-black options
const PRESET_COLORS = [
  { hex: '#059669', name: 'Xanh lục' },
  { hex: '#10B981', name: 'Ngọc lục' },
  { hex: '#3B82F6', name: 'Xanh dương' },
  { hex: '#8B5CF6', name: 'Tím' },
  { hex: '#EF4444', name: 'Đỏ' },
  { hex: '#EC4899', name: 'Hồng' },
  { hex: '#06B6D4', name: 'Cyan' },
  { hex: '#818CF8', name: 'Indigo' },
  { hex: '#F43F5E', name: 'Rose' },
  { hex: '#F59E0B', name: 'Cam' },
]

export function PersonalizationSettings() {
  const { settings, updateAppName, updateAccentColor } = usePersonalization()
  const [nameInput, setNameInput] = useState(settings.appName)

  return (
    <div className="space-y-6 pb-2">
      {/* App name */}
      <div className="space-y-2 px-4 text-left">
        <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block ml-1">
          Tên hiển thị
        </label>
        <div className="relative group">
          <input
            type="text"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onBlur={() => updateAppName(nameInput)}
            placeholder="Mochi Money"
            maxLength={20}
            className="w-full h-13 rounded-2xl border-[1.5px] border-border bg-card px-4 pr-12 text-[15px] font-semibold text-text outline-none transition-all focus:border-accent shadow-sm"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-text-hint/70 pointer-events-none">
            {nameInput.length}/20
          </span>
        </div>
        <p className="text-[11px] text-text-hint ml-1 leading-relaxed">
          Hiển thị ở đầu trang chủ và màn hình loading
        </p>
      </div>

      {/* Accent color */}
      <div className="space-y-3">
        <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block ml-5 text-left">
          Màu chủ đạo
        </label>

        {/* Horizontal Scrollable Color Picker */}
        <div 
          className="flex gap-3 overflow-x-auto px-5 p-4 scrollbar-hide -webkit-overflow-scrolling-touch"
          style={{ scrollSnapType: 'x proximity' }}
        >
          {PRESET_COLORS.map(c => {
            const isActive = settings.accentColor === c.hex
            return (
              <button
                key={c.hex}
                onClick={() => updateAccentColor(c.hex)}
                className={cn(
                  "relative shrink-0 w-11 h-11 rounded-full transition-all active:scale-95 shadow-sm overflow-hidden flex items-center justify-center",
                  isActive ? "ring-2 ring-offset-2 ring-offset-bg ring-accent scale-105" : "hover:scale-105 opacity-80"
                )}
                style={{ 
                    backgroundColor: c.hex,
                    scrollSnapAlign: 'start'
                }}
              >
                {isActive && (
                  <Check className="size-5 text-white drop-shadow-sm" strokeWidth={3} />
                )}
              </button>
            )
          })}
          {/* Spacer for end of scroll */}
          <div className="shrink-0 w-2" />
        </div>

        {/* Real-time Theme Preview Card */}
        <div className="px-4">
            <div 
            className="bg-card rounded-2xl p-4 border shadow-premium transition-colors"
            style={{ borderColor: tint(settings.accentColor, 19) }}
            >
            <div className="flex items-center gap-3">
                <div 
                className="size-10 rounded-xl flex items-center justify-center shadow-lg transition-transform active:scale-95"
                style={{ 
                    backgroundColor: settings.accentColor,
                    boxShadow: `0 8px 20px -6px ${tint(settings.accentColor, 38)}`
                }}
                >
                <span className="text-xl text-white font-bold">+</span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                <p className="text-[13px] font-bold truncate" style={{ color: settings.accentColor }}>
                    {nameInput || 'Mochi Money'}
                </p>
                <div className="h-1.5 w-full bg-surface rounded-full mt-1.5 overflow-hidden">
                    <div 
                    className="h-full rounded-full transition-all duration-500 ease-out" 
                    style={{ 
                        width: '65%', 
                        backgroundColor: settings.accentColor 
                    }} 
                    />
                </div>
                </div>
                <span className="text-[12px] font-black" style={{ color: settings.accentColor }}>
                65%
                </span>
            </div>
            </div>
            <p className="text-[11px] text-text-hint mt-3 leading-relaxed text-left">
            Chọn màu sắc đại diện cho phong cách cá nhân của bạn.
            </p>
        </div>
      </div>
    </div>
  )
}
