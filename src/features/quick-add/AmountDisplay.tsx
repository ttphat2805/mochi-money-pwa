interface AmountDisplayProps {
  display: string
  hasValue: boolean
}

export function AmountDisplay({ display, hasValue }: AmountDisplayProps) {
  return (
    <div className="flex flex-col items-center py-2">
      <span className="text-text-hint mb-1.5 text-[11px] font-medium uppercase tracking-[1.2px]">
        Số tiền
      </span>
      <div className="flex items-baseline">
        <span
          className={`font-num text-[44px] font-bold leading-none tracking-[-2px] transition-colors ${
            hasValue ? 'text-text' : 'text-text-hint'
          }`}
        >
          {display}
        </span>
        <span className="text-text-muted ml-0.5 text-lg">đ</span>
      </div>
    </div>
  )
}
