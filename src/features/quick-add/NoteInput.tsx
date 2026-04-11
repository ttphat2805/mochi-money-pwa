import { useState, useRef } from 'react'
import { Pencil } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { usePersonalization } from '@/hooks/usePersonalization'

interface NoteInputProps {
  value: string
  onChange: (value: string) => void
}

export function NoteInput({ value, onChange }: NoteInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { settings } = usePersonalization()
  const accent = settings.accentColor || '#E8A020'

  const hasValue = value.length > 0

  return (
    <motion.div
      onClick={() => inputRef.current?.focus()}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-text transition-all duration-200",
        isFocused || hasValue
          ? "bg-white border border-border/40"
          : "bg-white/50 border border-dashed border-border/30"
      )}
    >
      <Pencil
        size={12}
        className="shrink-0 transition-colors duration-200"
        style={{ color: isFocused ? accent : '#9CA3AF' }}
      />

      <input
        ref={inputRef}
        type="text"
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ghi chú (tùy chọn)"
        className="w-full bg-transparent text-[12px] font-medium outline-none text-text leading-none"
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
