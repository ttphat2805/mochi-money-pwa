/**
 * Smart amount suggestions for the numpad.
 *
 * Users rarely type the trailing zeros of a VND amount, so we expand the
 * digits they typed into realistic amounts:
 *   1   → 10K, 100K, 1tr
 *   15  → 15K, 150K, 1tr5
 *   150 → 150K, 1tr5, 15tr
 *
 * Only short inputs (≤ 3 digits) get suggestions — once the user has typed
 * 4+ digits they are clearly entering the exact amount themselves.
 */

const MIN_SUGGESTION = 10_000
const MAX_SUGGESTION = 99_999_999_999 // matches MAX_DIGITS = 11 in useQuickAdd
const MAX_INPUT_FOR_SUGGESTIONS = 999

export function getAmountSuggestions(amount: number, limit = 3): number[] {
  if (amount <= 0 || amount > MAX_INPUT_FOR_SUGGESTIONS) return []

  const suggestions: number[] = []
  for (let multiplier = 1_000; suggestions.length < limit; multiplier *= 10) {
    const value = amount * multiplier
    if (value > MAX_SUGGESTION) break
    if (value >= MIN_SUGGESTION) suggestions.push(value)
  }
  return suggestions
}

/**
 * Vietnamese spoken-style label: 15000→"15K", 1500000→"1tr5", 15000000→"15tr"
 */
export function formatSuggestionLabel(value: number): string {
  if (value < 1_000_000) return `${value / 1_000}K`

  const millions = Math.floor(value / 1_000_000)
  const remainder = value % 1_000_000
  if (remainder === 0) return `${millions}tr`

  const fraction = String(remainder).padStart(6, '0').replace(/0+$/, '')
  return `${millions}tr${fraction}`
}
