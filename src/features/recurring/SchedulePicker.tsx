import type { SchedulePreset } from '@/hooks/useRecurringForm'

const PRESETS: { key: SchedulePreset; label: string }[] = [
  { key: 'daily', label: 'Hằng ngày' },
  { key: 'weekdays', label: 'Thứ 2–6' },
  { key: 'custom', label: 'Tuỳ chọn' },
]

const DAYS: { day: number; label: string }[] = [
  { day: 0, label: 'CN' },
  { day: 1, label: 'T2' },
  { day: 2, label: 'T3' },
  { day: 3, label: 'T4' },
  { day: 4, label: 'T5' },
  { day: 5, label: 'T6' },
  { day: 6, label: 'T7' },
]

interface SchedulePickerProps {
  preset: SchedulePreset
  customDays: number[]
  onPreset: (p: SchedulePreset) => void
  onToggleDay: (day: number) => void
}

export function SchedulePicker({ preset, customDays, onPreset, onToggleDay }: SchedulePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-text-hint text-[10px] font-medium uppercase tracking-[1.2px]">
        Lặp lại
      </span>

      {/* Preset chips */}
      <div className="flex gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => onPreset(p.key)}
            className={`h-9 flex-1 rounded-full border-[1.5px] text-[13px] font-medium transition-all ${
              preset === p.key
                ? 'border-accent bg-accent text-white'
                : 'border-border bg-white text-text-muted active:bg-surface'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Day toggles — only when custom */}
      {preset === 'custom' && (
        <div className="flex gap-1.5">
          {DAYS.map(({ day, label }) => {
            const isOn = customDays.includes(day)
            return (
              <button
                key={day}
                type="button"
                onClick={() => onToggleDay(day)}
                className={`flex-1 flex items-center justify-center rounded-full text-[12px] font-semibold transition-all ${
                  isOn
                    ? 'bg-accent text-white'
                    : 'bg-surface text-text-muted active:bg-surface2'
                }`}
                style={{ height: 36, minWidth: 36 }}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
