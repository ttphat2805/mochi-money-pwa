import { createElement } from 'react'
import { resolveCategoryIcon } from '@/lib/categoryIcons'

/**
 * Renders a category's icon as an SVG.
 * Accepts both registry names and legacy emojis (falls back gracefully).
 */
export function CategoryIcon({
  icon,
  color,
  size = 18,
  strokeWidth = 2,
  className,
}: {
  icon: string | undefined | null
  color?: string
  size?: number
  strokeWidth?: number
  className?: string
}) {
  return createElement(resolveCategoryIcon(icon), {
    size,
    strokeWidth,
    className,
    style: color ? { color } : undefined,
    'aria-hidden': true,
  })
}
