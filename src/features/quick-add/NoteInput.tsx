import { Pencil } from 'lucide-react'

interface NoteInputProps {
  value: string
  onChange: (value: string) => void
}

export function NoteInput({ value, onChange }: NoteInputProps) {
  return (
    <div className="border-border flex flex-1 items-center gap-2 border-b pb-2">
      <Pencil className="text-text-hint size-4 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ghi chú (tùy chọn)"
        className="w-full bg-transparent text-[13px] outline-none placeholder:text-text-hint"
        maxLength={100}
      />
    </div>
  )
}
