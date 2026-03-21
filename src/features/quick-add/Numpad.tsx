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
      className="grid grid-cols-3 gap-2 px-4"
      style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
    >
      {KEYS.map((digit) => (
        <button
          key={digit}
          type="button"
          onClick={() => onDigit(digit)}
          className="bg-surface active:bg-surface2 flex h-[52px] items-center justify-center rounded-xl text-xl font-medium transition-colors"
        >
          {digit}
        </button>
      ))}

      {/* Bottom row: backspace, 0, save */}
      <button
        type="button"
        onClick={onDelete}
        className="active:bg-surface flex h-[52px] items-center justify-center rounded-xl transition-colors"
        aria-label="Xóa"
      >
        <Delete className="text-text-muted size-5" />
      </button>

      <button
        type="button"
        onClick={() => onDigit(0)}
        className="bg-surface active:bg-surface2 flex h-[52px] items-center justify-center rounded-xl text-xl font-medium transition-colors"
      >
        0
      </button>

      <button
        type="button"
        onClick={onConfirm}
        disabled={!canConfirm || isSaving}
        className="bg-accent active:bg-accent-dark flex h-[52px] items-center justify-center rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
      >
        {isSaving ? '...' : 'Lưu'}
      </button>
    </div>
  )
}
