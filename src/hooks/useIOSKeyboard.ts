import { useEffect } from 'react'

/**
 * useIOSKeyboard
 *
 * Fixes the infamous iOS Safari / PWA keyboard bug where:
 *  1. Tapping an input pushes the whole UI upward (bounces layout).
 *  2. After blur, the viewport leaves a blank gap equal to the keyboard height.
 *
 * Root cause: iOS does NOT resize `window.innerHeight` or `dvh` correctly when
 * the soft keyboard opens — instead it translates the layout frame, smashing
 * fixed/absolute elements and leaving dead space after keyboard hides.
 *
 * Fix strategy — `visualViewport` API:
 *  • `vv.height`     → actual visible area (shrinks when keyboard opens)
 *  • `vv.offsetTop`  → how many px the viewport has scrolled INTO the page
 *                       (iOS sets this to push content above the keyboard)
 *
 * We pin #root with `position: fixed` so it tracks the visual viewport
 * exactly. Because fixed elements are anchored to the layout viewport (not
 * the visual viewport on iOS), we compensate with `top: offsetTop`.
 *
 * Max-width centering: fixed elements can't use `margin: auto`, so we centre
 * via `left: 50%; transform: translateX(-50%)` while capping at 480 px.
 */

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPad on iOS 13+ reports itself as MacIntel
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

export function useIOSKeyboard() {
  useEffect(() => {
    // ── Global: blur any focused input when Enter is pressed ──────────────
    // This gives a "Done" behaviour on iOS keyboard across ALL inputs in the app.
    const handleEnterKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const target = e.target as HTMLElement
        if (
          target &&
          (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') &&
          !(target as HTMLInputElement).form // not in a form that should submit
        ) {
          e.preventDefault()
          target.blur()
        }
      }
    }
    document.addEventListener('keydown', handleEnterKey)

    // ── iOS-specific: pin root to visualViewport ───────────────────────────
    if (!isIOS()) {
      return () => {
        document.removeEventListener('keydown', handleEnterKey)
      }
    }

    const vv = window.visualViewport
    if (!vv) {
      return () => {
        document.removeEventListener('keydown', handleEnterKey)
      }
    }

    const root = document.getElementById('root')
    if (!root) {
      return () => {
        document.removeEventListener('keydown', handleEnterKey)
      }
    }

    // Centre via transform (position:fixed removes element from normal flow,
    // so margin:auto does not work for horizontal centering)
    root.style.left = '50%'
    root.style.transform = 'translateX(-50%)'
    root.style.margin = '0'

    let rafId: number | null = null

    const syncViewport = () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        // Respect max-width: 480px; use full visual width on narrower screens
        const maxW = Math.min(vv.width, 480)

        root.style.position = 'fixed'
        root.style.top = `${vv.offsetTop}px`
        root.style.width = `${maxW}px`
        root.style.height = `${vv.height}px`
        root.style.maxWidth = '100%'
      })
    }

    // Sync once immediately (keyboard might already be open e.g. after refresh)
    syncViewport()

    vv.addEventListener('resize', syncViewport)
    vv.addEventListener('scroll', syncViewport)

    // Block the body from scrolling when iOS auto-scrolls on input focus
    const blockBodyScroll = (e: Event) => e.preventDefault()
    document.body.addEventListener('scroll', blockBodyScroll, { passive: false })

    return () => {
      document.removeEventListener('keydown', handleEnterKey)
      vv.removeEventListener('resize', syncViewport)
      vv.removeEventListener('scroll', syncViewport)
      document.body.removeEventListener('scroll', blockBodyScroll)

      // Reset inline styles on unmount
      root.style.position = ''
      root.style.top = ''
      root.style.left = ''
      root.style.width = ''
      root.style.height = ''
      root.style.maxWidth = ''
      root.style.transform = ''
      root.style.margin = ''
    }
  }, [])
}
