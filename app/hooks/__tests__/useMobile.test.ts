import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMobile } from '../useMobile'

describe('useMobile', () => {
  let listeners: Array<(e: { matches: boolean }) => void>
  let currentMatches: boolean

  beforeEach(() => {
    listeners = []
    currentMatches = false
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn((query: string) => ({
        get matches() { return currentMatches },
        media: query,
        onchange: null,
        addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => listeners.push(cb),
        removeEventListener: (_: string, cb: (e: { matches: boolean }) => void) => {
          listeners = listeners.filter(l => l !== cb)
        },
        dispatchEvent: () => false,
      })),
    })
  })

  it('returns false when viewport is wider than breakpoint', () => {
    currentMatches = false
    const { result } = renderHook(() => useMobile())
    expect(result.current).toBe(false)
  })

  it('returns true when viewport is narrower than breakpoint', () => {
    currentMatches = true
    const { result } = renderHook(() => useMobile())
    expect(result.current).toBe(true)
  })

  it('updates when viewport changes', () => {
    currentMatches = false
    const { result } = renderHook(() => useMobile())
    expect(result.current).toBe(false)

    act(() => {
      currentMatches = true
      listeners.forEach(l => l({ matches: true }))
    })

    expect(result.current).toBe(true)
  })

  it('removes event listener on unmount', () => {
    const { unmount } = renderHook(() => useMobile())
    expect(listeners).toHaveLength(1)
    unmount()
    expect(listeners).toHaveLength(0)
  })
})
