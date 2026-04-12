import { useState, useRef } from 'react'
import { Pencil } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { usePersonalization } from '@/hooks/usePersonalization'

interface NoteInputProps {
  value: string
  onChange: (value: string) => void
  onFocusChange?: (focused: boolean) => void
}

export function NoteInput({ value, onChange, onFocusChange }: NoteInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { settings } = usePersonalization()
  const accent = settings.accentColor || '#E8A020'

  const hasValue = value.length > 0

  return (
    <motion.div
      onClick={() => inputRef.current?.focus()}
      className={cn(
        "flex items-center gap-3 px-4 rounded-[20px] cursor-text transition-all duration-300",
        isFocused
          ? "bg-white border-2 border-accent shadow-lg py-4"
          : hasValue
            ? "bg-white border border-border/40 py-3"
            : "bg-white/50 border border-dashed border-border/30 py-3"
      )}
    >
      <Pencil
        size={isFocused ? 16 : 12}
        className="shrink-0 transition-colors duration-200"
        style={{ color: isFocused ? accent : '#9CA3AF' }}
      />

      <input
        ref={inputRef}
        type="text"
        value={value}
        onFocus={() => {
          setIsFocused(true)
          onFocusChange?.(true)
        }}
        onBlur={() => {
          setIsFocused(false)
          onFocusChange?.(false)
        }}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ghi chú (tùy chọn)"
        className={cn(
          "w-full bg-transparent font-medium outline-none text-text leading-tight",
          isFocused ? "text-[16px]" : "text-[14px]"
        )}
        style={{
          '--placeholder-color': '#C0BDB5',
        } as React.CSSProperties}
        maxLength={100}
      />

      {/* Character counter - only when focused and has content */}
      <AnimatePresence>
        {isFocused && value.length > 60 && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[10px] text-text-hint/60 shrink-0 font-mono"
          >
            {100 - value.length}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
