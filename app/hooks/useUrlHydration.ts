import { useEffect } from 'react'
import type { AppAction } from '../lib/types'
import { parseSharedState } from '../lib/validators'

export function useUrlHydration(dispatch: React.Dispatch<AppAction>): void {
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('model')
    if (raw) {
      const parsed = parseSharedState(raw)
      if (parsed) dispatch({ type: 'HYDRATE_FROM_URL', state: parsed })
    }
  // dispatch from useReducer is stable — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
