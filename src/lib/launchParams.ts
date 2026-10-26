import type { TabKey } from '@/components/BottomNav'
import type { BudgetCategory } from '@/types'

/**
 * Launch URL parameters — used by PWA manifest shortcuts (long-press the app
 * icon on Android / desktop) and by links such as iOS Shortcuts "Open URL".
 *
 *   /?add                      → open quick-add
 *   /?add=35000&cat=cafe       → quick-add pre-filled with 35.000đ in "Cafe…"
 *   /?tab=calendar             → open a tab
 */

const TABS: readonly TabKey[] = ['home', 'budget', 'calendar', 'overview']
const MAX_AMOUNT_DIGITS = 11

export interface LaunchParams {
  tab: TabKey | null
  quickAdd: { amount: number | null; categoryQuery: string | null } | null
}

/** Lowercase, strip Vietnamese diacritics, collapse separators: "Cà phê" → "ca phe" */
export function normalizeForMatch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function parseLaunchParams(search: string): LaunchParams {
  const params = new URLSearchParams(search)

  const tabParam = params.get('tab')
  const tab = TABS.find((t) => t === tabParam) ?? null

  let quickAdd: LaunchParams['quickAdd'] = null
  if (params.has('add')) {
    const digits = (params.get('add') ?? '').replace(/\D/g, '')
    const amount =
      digits && digits.length <= MAX_AMOUNT_DIGITS ? parseInt(digits, 10) || null : null
    const cat = params.get('cat')
    quickAdd = { amount, categoryQuery: cat ? normalizeForMatch(cat) : null }
  }

  return { tab, quickAdd }
}

/** Exact name match first, then prefix, then substring */
export function findCategoryByQuery(
  categories: BudgetCategory[],
  query: string,
): BudgetCategory | undefined {
  if (!query) return undefined
  const named = categories.map((c) => ({ c, name: normalizeForMatch(c.name) }))
  return (
    named.find((n) => n.name === query)?.c ??
    named.find((n) => n.name.startsWith(query))?.c ??
    named.find((n) => n.name.includes(query))?.c
  )
}

export function hasLaunchParams(search: string): boolean {
  const params = new URLSearchParams(search)
  return params.has('add') || params.has('tab')
}
