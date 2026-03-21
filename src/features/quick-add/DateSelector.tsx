import { Calendar } from 'lucide-react'

interface DateSelectorProps {
  dateLabel: string
  onTap: () => void
}

export function DateSelector({ dateLabel, onTap }: DateSelectorProps) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="border-border flex shrink-0 items-center gap-2 border-b pb-2"
    >
      <Calendar className="text-text-hint size-4" />
      <span className="text-[13px] font-medium">{dateLabel}</span>
    </button>
  )
}
