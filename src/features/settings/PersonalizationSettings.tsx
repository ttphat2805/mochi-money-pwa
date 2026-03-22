import { useState } from 'react'
import { usePersonalization } from '@/hooks/usePersonalization'

export function PersonalizationSettings() {
  const { settings, updateAppName, updateAccentColor } = usePersonalization()
  const [nameInput, setNameInput] = useState(settings.appName)

  const PRESET_COLORS = [
    { hex: '#E8A020', name: 'Amber' },
    { hex: '#2A9D6E', name: 'Xanh lá' },
    { hex: '#378ADD', name: 'Xanh dương' },
    { hex: '#7C3AED', name: 'Tím' },
    { hex: '#D63E3E', name: 'Đỏ' },
    { hex: '#DB2777', name: 'Hồng' },
    { hex: '#0891B2', name: 'Cyan' },
    { hex: '#1A1A18', name: 'Đen' },
  ]

  return (
    <div className="mb-6">
      {/* App name */}
      <div style={{ padding: '0 16px', marginBottom: 20 }}>
        <label style={{
          fontSize: 11, fontWeight: 500,
          color: '#88887A', textTransform: 'uppercase',
          letterSpacing: '0.6px', display: 'block', marginBottom: 8,
        }}>
          Tên hiển thị
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onBlur={() => updateAppName(nameInput)}
            placeholder="Chi Tiêu"
            maxLength={20}
            style={{
              width: '100%', height: 48,
              borderRadius: 14,
              border: '1.5px solid #E2E0D8',
              background: 'white',
              padding: '0 44px 0 16px',
              fontSize: 16, fontWeight: 500,
              color: '#1A1A18', outline: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }}
            onFocus={e =>
              e.target.style.borderColor = settings.accentColor
            }
            onBlurCapture={e => e.target.style.borderColor = '#E2E0D8'}
          />
          {/* Character count */}
          <span style={{
            position: 'absolute', right: 14,
            top: '50%', transform: 'translateY(-50%)',
            fontSize: 11, color: '#C0BEB4',
          }}>
            {nameInput.length}/20
          </span>
        </div>
        <p style={{ fontSize: 11, color: '#B8B8A8', marginTop: 6 }}>
          Hiển thị ở đầu trang chủ và màn hình loading
        </p>
      </div>

      {/* Accent color */}
      <div style={{ padding: '0 16px' }}>
        <label style={{
          fontSize: 11, fontWeight: 500,
          color: '#88887A', textTransform: 'uppercase',
          letterSpacing: '0.6px', display: 'block', marginBottom: 12,
        }}>
          Màu chủ đạo
        </label>

        {/* Color swatches */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: 10,
          marginBottom: 16,
        }}>
          {PRESET_COLORS.map(c => (
            <button
              key={c.hex}
              onClick={() => updateAccentColor(c.hex)}
              title={c.name}
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: 12,
                background: c.hex,
                border: settings.accentColor === c.hex
                  ? `3px solid ${c.hex}`
                  : '3px solid transparent',
                outline: settings.accentColor === c.hex
                  ? `2px solid white`
                  : 'none',
                outlineOffset: -5,
                cursor: 'pointer',
                transition: 'transform 0.15s',
                boxShadow: `0 3px 10px ${c.hex}50`,
              }}
              onTouchStart={e =>
                (e.currentTarget.style.transform = 'scale(0.88)')
              }
              onTouchEnd={e =>
                (e.currentTarget.style.transform = 'scale(1)')
              }
            />
          ))}
        </div>

        {/* Preview */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: '14px 16px',
          border: `1.5px solid ${settings.accentColor}30`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          {/* Mini preview elements */}
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: settings.accentColor,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${settings.accentColor}50`,
          }}>
            <span style={{ fontSize: 16, color: 'white' }}>+</span>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{
              fontSize: 12, fontWeight: 600,
              color: settings.accentColor,
            }}>
              {settings.appName || 'Chi Tiêu'}
            </p>
            <div style={{
              height: 4, borderRadius: 99, marginTop: 5,
              background: settings.accentColor + '20',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: 99,
                width: '65%',
                background: settings.accentColor,
              }} />
            </div>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: settings.accentColor,
            fontFamily: 'monospace',
          }}>
            65%
          </span>
        </div>
        <p style={{ fontSize: 11, color: '#B8B8A8', marginTop: 8 }}>
          Áp dụng cho toàn bộ app — FAB, progress bar, active states
        </p>
      </div>
    </div>
  )
}
