export const triggerHaptic = (pattern: 'light' | 'medium' | 'heavy' | 'success' = 'light') => {
  if (typeof window !== 'undefined' && navigator.vibrate) {
    try {
      if (pattern === 'light') navigator.vibrate(10)
      if (pattern === 'medium') navigator.vibrate(20)
      if (pattern === 'heavy') navigator.vibrate(40)
      if (pattern === 'success') navigator.vibrate([30, 50, 40])
    } catch {
      // Ignore vibration errors
    }
  }
}
