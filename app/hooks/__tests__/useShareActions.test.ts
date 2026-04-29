import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useShareActions } from '../useShareActions'
import { INITIAL_STATE } from '../../lib/reducer'

vi.mock('posthog-js/react', () => ({ usePostHog: () => ({ capture: vi.fn() }) }))

describe('useShareActions', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true,
    })
    window.history.replaceState(null, '', '/')
  })

  it('starts with no button in copied state', () => {
    const { result } = renderHook(() => useShareActions(INITIAL_STATE))
    expect(result.current.copiedBtn).toBeNull()
  })

  it('handleShare writes encoded URL to clipboard and sets copiedBtn', async () => {
    const { result } = renderHook(() => useShareActions(INITIAL_STATE))

    await act(async () => { await result.current.handleShare() })

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('?model='),
    )
    expect(result.current.copiedBtn).toBe('share')
  })

  it('handleCopySummary writes text to clipboard and sets copiedBtn', async () => {
    const { result } = renderHook(() => useShareActions(INITIAL_STATE))

    await act(async () => { await result.current.handleCopySummary() })

    expect(navigator.clipboard.writeText).toHaveBeenCalled()
    expect(result.current.copiedBtn).toBe('summary')
  })

  it('handleShare falls back to window.prompt on clipboard failure', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValueOnce(new Error('denied'))
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue(null)

    const { result } = renderHook(() => useShareActions(INITIAL_STATE))
    await act(async () => { await result.current.handleShare() })

    expect(promptSpy).toHaveBeenCalled()
  })
})
