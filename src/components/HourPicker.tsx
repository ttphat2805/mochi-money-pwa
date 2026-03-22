interface HourPickerProps {
  value: number
  onChange: (hour: number) => void
}

const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]

export function HourPicker({ value, onChange }: HourPickerProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-1">
      {HOURS.map((h) => (
        <button
          key={h}
          type="button"
          onClick={() => onChange(h)}
          className={`snap-center flex-shrink-0 flex items-center justify-center size-10 rounded-xl text-[14px] font-semibold transition-all ${
            value === h
              ? 'bg-text text-white shadow-md scale-110'
              : 'bg-surface text-text-muted hover:bg-surface2'
          }`}
        >
          {h}h
        </button>
      ))}
    </div>
  )
}
