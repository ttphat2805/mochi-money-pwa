/**
 * Pure search helpers for transactions — no DB / React, so they're testable.
 *
 * Text matching is Vietnamese diacritics-insensitive: "ca phe" matches "Cà phê".
 * Amount matching:
 *   "45000" / "45.000" → amount contains the digits "45000"
 *   "45k"             → exactly 45.000
 *   "1tr5" / "2tr"    → exactly 1.500.000 / 2.000.000
 */

export interface SearchableTransaction {
  amount: number
  note?: string
  categoryName?: string
}

/** Lowercase, strip diacritics, map đ → d, collapse whitespace */
export function normalizeText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/** Parses shorthand amounts: "45k" → 45000, "1tr5" → 1500000. Null if not shorthand. */
export function parseShorthandAmount(query: string): number | null {
  const q = query.replace(/\s/g, '').toLowerCase()

  const k = /^(\d+)k$/.exec(q)
  if (k) return parseInt(k[1], 10) * 1_000

  const tr = /^(\d+)tr(\d*)$/.exec(q)
  if (tr) {
    const millions = parseInt(tr[1], 10) * 1_000_000
    // "1tr5" → 500.000, "1tr25" → 250.000 (fraction digits, padded to 6)
    const fraction = tr[2] ? parseInt(tr[2].padEnd(6, '0').slice(0, 6), 10) : 0
    return millions + fraction
  }

  return null
}

/** Digits-only query ("45.000", "45 000") → "45000"; null if it has other characters */
function digitsQuery(query: string): string | null {
  const stripped = query.replace(/[.,\s]/g, '')
  return /^\d+$/.test(stripped) ? stripped : null
}

/** Returns a predicate for the query, or null when the query is empty */
export function buildMatcher(query: string): ((tx: SearchableTransaction) => boolean) | null {
  const trimmed = query.trim()
  if (!trimmed) return null

  const shorthand = parseShorthandAmount(trimmed)
  if (shorthand !== null) return (tx) => tx.amount === shorthand

  const digits = digitsQuery(trimmed)
  const text = normalizeText(trimmed)

  return (tx) => {
    if (digits !== null && String(tx.amount).includes(digits)) return true
    const haystack = normalizeText(`${tx.note ?? ''} ${tx.categoryName ?? ''}`)
    return haystack.includes(text)
  }
}
