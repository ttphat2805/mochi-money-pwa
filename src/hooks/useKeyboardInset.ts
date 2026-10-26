import { useEffect, useState } from 'react'

/**
 * useKeyboardInset
 *
 * Returns the height (px) of the on-screen keyboard currently covering the
 * bottom of the layout viewport, and the visible viewport height.
 *
 * Why not vaul's built-in `repositionInputs`: it toggles an internal
 * `keyboardIsOpen` flag on every visualViewport resize > 60px. iOS fires
 * several resize events while the keyboard + suggestion bar animate, so the
 * flag can end up inverted and the drawer keeps its shrunken inline height
 * after the keyboard closes (blank gap, clipped numpad).
 *
 * This hook is stateless with respect to "open/closed": every value is derived
 * from the current visualViewport, so closing the keyboard always yields 0.
 */

// Ignore small viewport changes (iOS toolbar / predictive bar jitter)
const MIN_KEYBOARD_HEIGHT = 80

interface KeyboardInset {
  /** px covered by the keyboard at the bottom of the layout viewport */
  inset: number
  /** visible viewport height (px) */
  viewportHeight: number
}

function readInset(): KeyboardInset {
  const vv = window.visualViewport
  if (!vv) return { inset: 0, viewportHeight: window.innerHeight }

  const covered = window.innerHeight - vv.height - vv.offsetTop
  return {
    inset: covered >= MIN_KEYBOARD_HEIGHT ? Math.round(covered) : 0,
    viewportHeight: Math.round(vv.height),
  }
}

export function useKeyboardInset(enabled = true): KeyboardInset {
  const [state, setState] = useState<KeyboardInset>(() =>
    typeof window === 'undefined'
      ? { inset: 0, viewportHeight: 0 }
      : readInset(),
  )

  useEffect(() => {
    if (!enabled) return
    const vv = window.visualViewport
    if (!vv) return

    let rafId: number | null = null
    let settleTimer: ReturnType<typeof setTimeout> | null = null

    const sync = () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const next = readInset()
        setState((prev) =>
          prev.inset === next.inset &&
          prev.viewportHeight === next.viewportHeight
            ? prev
            : next,
        )
      })
    }

    // iOS standalone PWAs sometimes skip the final resize event after the
    // keyboard hides — re-measure once the dismiss animation has settled.
    const syncAfterBlur = () => {
      if (settleTimer) clearTimeout(settleTimer)
      settleTimer = setTimeout(sync, 350)
    }

    sync()
    vv.addEventListener('resize', sync)
    vv.addEventListener('scroll', sync)
    document.addEventListener('focusout', syncAfterBlur)

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      if (settleTimer) clearTimeout(settleTimer)
      vv.removeEventListener('resize', sync)
      vv.removeEventListener('scroll', sync)
      document.removeEventListener('focusout', syncAfterBlur)
    }
  }, [enabled])

  return enabled ? state : { inset: 0, viewportHeight: state.viewportHeight }
}
