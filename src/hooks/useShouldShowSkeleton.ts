import { useState, useEffect } from 'react'

export function useShouldShowSkeleton(isLoading: boolean, delay = 100) {
  const [show, setShow] = useState(false)
  const [prevIsLoading, setPrevIsLoading] = useState(isLoading)

  // Adjusting state during render is preferred over syncing it in an effect
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (isLoading !== prevIsLoading) {
    setPrevIsLoading(isLoading)
    if (!isLoading) {
      setShow(false)
    }
  }

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined
    if (isLoading) {
      t = setTimeout(() => setShow(true), delay)
    }
    return () => {
      if (t) clearTimeout(t)
    }
  }, [isLoading, delay])

  return isLoading && show
}
