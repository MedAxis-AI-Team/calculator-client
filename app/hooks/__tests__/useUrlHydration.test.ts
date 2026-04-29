import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useUrlHydration } from '../useUrlHydration'
import { encodeState } from '../../lib/validators'
import { INITIAL_STATE } from '../../lib/reducer'

describe('useUrlHydration', () => {
  beforeEach(() => {
    // Reset URL to clean state
    window.history.replaceState(null, '', '/')
  })

  it('dispatches HYDRATE_FROM_URL when valid ?model= param is present', () => {
    const encoded = encodeState(INITIAL_STATE)
    window.history.replaceState(null, '', `/?model=${encoded}`)

    const dispatch = vi.fn()
    renderHook(() => useUrlHydration(dispatch))

    expect(dispatch).toHaveBeenCalledWith({
      type: 'HYDRATE_FROM_URL',
      state: expect.objectContaining({ version: 1 }),
    })
  })

  it('does not dispatch when no ?model= param', () => {
    const dispatch = vi.fn()
    renderHook(() => useUrlHydration(dispatch))
    expect(dispatch).not.toHaveBeenCalled()
  })

  it('does not dispatch when ?model= param is invalid base64', () => {
    window.history.replaceState(null, '', '/?model=not-valid-base64!!!')
    const dispatch = vi.fn()
    renderHook(() => useUrlHydration(dispatch))
    expect(dispatch).not.toHaveBeenCalled()
  })

  it('only runs on mount, not on re-render', () => {
    const encoded = encodeState(INITIAL_STATE)
    window.history.replaceState(null, '', `/?model=${encoded}`)

    const dispatch = vi.fn()
    const { rerender } = renderHook(() => useUrlHydration(dispatch))
    rerender()
    rerender()

    expect(dispatch).toHaveBeenCalledTimes(1)
  })
})
