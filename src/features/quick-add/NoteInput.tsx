import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface NoteInputProps {
  value: string
  onChange: (value: string) => void
}

export function NoteInput({ value, onChange }: NoteInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="relative flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 border border-border/30 shadow-none transition-colors">
      <Pencil className={`size-3 shrink-0 transition-colors ${isFocused ? 'text-accent' : 'text-text-hint/60'}`} />
      <input
        type="text"
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ghi chú (tùy chọn)"
        className="w-full bg-transparent text-[12px] font-bold outline-none placeholder:text-text-hint/50 text-text relative z-10"
        maxLength={100}
      />
      
      {/* Animated Focus Ring */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 rounded-xl border-2 border-accent/50 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
