import { Delete } from 'lucide-react'

interface NumpadProps {
  onDigit: (digit: number) => void
  onDelete: () => void
  onConfirm: () => void
  canConfirm: boolean
  isSaving: boolean
}

const KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

export function Numpad({ onDigit, onDelete, onConfirm, canConfirm, isSaving }: NumpadProps) {
  return (
    <div
      className="grid grid-cols-3 gap-2.5 px-5"
      style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}
    >
      {KEYS.map((digit) => (
        <button
          key={digit}
          type="button"
          onClick={() => onDigit(digit)}
          className="bg-white border border-border/40 shadow-sm active:bg-surface active:scale-[0.96] flex h-[60px] items-center justify-center rounded-2xl text-[22px] font-semibold text-text transition-all duration-100"
        >
          {digit}
        </button>
      ))}

      {/* Bottom row: backspace, 0, save */}
      <button
        type="button"
        onClick={onDelete}
        className="active:bg-surface active:scale-[0.96] flex h-[60px] items-center justify-center rounded-2xl transition-all duration-100"
        aria-label="Xóa"
      >
        <Delete className="text-text-muted size-6" />
      </button>

      <button
        type="button"
        onClick={() => onDigit(0)}
        className="bg-white border border-border/40 shadow-sm active:bg-surface active:scale-[0.96] flex h-[60px] items-center justify-center rounded-2xl text-[22px] font-semibold text-text transition-all duration-100"
      >
        0
      </button>

      <button
        type="button"
        onClick={onConfirm}
        disabled={!canConfirm || isSaving}
        className="bg-text text-white shadow-md active:bg-text/90 active:scale-[0.96] flex h-[60px] items-center justify-center rounded-2xl text-[15px] font-bold transition-all duration-100 disabled:opacity-30 disabled:pointer-events-none"
      >
        {isSaving ? '...' : 'Lưu'}
      </button>
    </div>
  )
}
