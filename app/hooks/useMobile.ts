import { useState, useEffect } from 'react'

export function useMobile(breakpoint = 480): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`)
    // handler accepts any object with .matches so it can be called with both
    // MediaQueryList (for the initial sync) and MediaQueryListEvent (for updates).
    const handler = ({ matches }: { matches: boolean }) => setIsMobile(matches)
    handler(mq)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [breakpoint])

  return isMobile
}
