interface HourPickerProps {
  value: number
  onChange: (hour: number) => void
}

const HOURS = [6, 7, 8, 9, 10, 11, 12]

export function HourPicker({ value, onChange }: HourPickerProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
      {HOURS.map((h) => (
        <button
          key={h}
          type="button"
          onClick={() => onChange(h)}
          className={`flex shrink-0 items-center justify-center rounded-full text-[13px] font-medium transition-colors w-10 h-8 ${
            value === h
              ? 'bg-accent text-white'
              : 'bg-surface text-text-muted active:bg-surface2'
          }`}
        >
          {h}h
        </button>
      ))}
    </div>
  )
}
