import { LEGACY_CATEGORY_COLOR_MAP, type BudgetCategory } from '@/types'

/**
 * Data-only category normalization — no React/lucide imports, so the DB
 * migration and backup restore can use it without pulling the icon component
 * registry into their chunks.
 */

/**
 * Emoji → icon-name mapping. Used by normalizeCategory (DB migration v5,
 * backup restore) and as a render-time fallback in lib/categoryIcons.
 */
export const EMOJI_TO_ICON: Record<string, string> = {
  '🍜': 'utensils', '🍚': 'utensils', '🍱': 'utensils', '🍔': 'pizza', '🍕': 'pizza',
  '☕': 'coffee', '🧋': 'cup-soda', '🥤': 'cup-soda', '🍦': 'ice-cream-cone', '🍡': 'ice-cream-cone',
  '🍺': 'beer', '🍻': 'beer', '🍷': 'beer',
  '🛒': 'shopping-cart', '🛍️': 'shopping-bag', '🛍': 'shopping-bag', '👕': 'shirt', '👗': 'shirt',
  '💄': 'sparkles', '✨': 'sparkles', '💇': 'scissors', '💈': 'scissors',
  '🚗': 'car', '🚕': 'car-taxi-front', '🚌': 'bus', '🚲': 'bike', '🏍️': 'bike',
  '⛽': 'fuel', '🔧': 'wrench', '✈️': 'plane',
  '🏠': 'house', '🏡': 'house', '⚡': 'plug', '💡': 'plug', '💧': 'droplets',
  '📶': 'wifi', '📱': 'smartphone', '📞': 'phone', '📺': 'tv',
  '🎮': 'gamepad-2', '🎬': 'clapperboard', '🎵': 'music', '🎧': 'music',
  '🎉': 'party-popper', '🎊': 'party-popper', '💪': 'dumbbell', '⚽': 'dumbbell',
  '💊': 'pill', '🏥': 'heart-pulse', '🩺': 'stethoscope',
  '🎓': 'graduation-cap', '📚': 'book-open', '📖': 'book-open',
  '👶': 'baby', '🐶': 'dog', '🐱': 'cat', '🐾': 'paw-print',
  '💳': 'credit-card', '💵': 'banknote', '💰': 'wallet', '👛': 'wallet',
  '🐷': 'piggy-bank', '🧾': 'receipt', '💼': 'briefcase', '🎁': 'gift',
  '📦': 'package',
}

/** Registry-style icon names are kebab-case ASCII; anything else is legacy */
const ICON_NAME_RE = /^[a-z0-9-]+$/

/**
 * Normalize a stored icon value to a registry-style name.
 * Unknown-but-valid names pass through (the renderer falls back to Package).
 */
export function normalizeCategoryIcon(value: string): string {
  if (ICON_NAME_RE.test(value)) return value
  return EMOJI_TO_ICON[value] ?? 'package'
}

/**
 * Bring a category from any older format (emoji icon, light-theme color)
 * into the current one. Used at every write boundary that can carry
 * pre-migration data: the Dexie v5 upgrade and backup restore.
 */
export function normalizeCategory<T extends Pick<BudgetCategory, 'icon' | 'color'>>(cat: T): T {
  cat.icon = normalizeCategoryIcon(cat.icon)
  const remapped = LEGACY_CATEGORY_COLOR_MAP[cat.color?.toUpperCase?.() ?? '']
  if (remapped) cat.color = remapped
  return cat
}
