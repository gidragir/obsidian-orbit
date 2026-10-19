import { describe, expect, it } from 'vitest'
import { InteractionGuardCore } from './interaction-guard'

describe('interaction-guard', () => {
  it('identifies busy state within debounce window', () => {
    const guard = new InteractionGuardCore()
    expect(guard.isBusy(1000, 1500)).toBe(false)

    guard.recordActivity(1000)
    expect(guard.isBusy(1500, 1500)).toBe(true)
    expect(guard.getRemainingBusyTime(1500, 1500)).toBe(1000)

    expect(guard.isBusy(2500, 1500)).toBe(false)
    expect(guard.getRemainingBusyTime(2500, 1500)).toBe(0)
  })

  it('tracks pause count and accumulated pause duration', () => {
    const guard = new InteractionGuardCore()
    guard.startPause(1000)
    expect(guard.getState().isPaused).toBe(true)
    expect(guard.getState().interactionPausesCount).toBe(1)

    // Repeated call while paused should not double-count
    guard.startPause(1100)
    expect(guard.getState().interactionPausesCount).toBe(1)

    guard.resume(1500)
    expect(guard.getState().isPaused).toBe(false)
    expect(guard.getState().totalInteractionPauseMs).toBe(500)

    // Second pause
    guard.startPause(2000)
    guard.resume(2300)
    expect(guard.getState().interactionPausesCount).toBe(2)
    expect(guard.getState().totalInteractionPauseMs).toBe(800)
  })

  it('resets state properly', () => {
    const guard = new InteractionGuardCore()
    guard.recordActivity(1000)
    guard.startPause(1000)
    guard.resume(2000)
    expect(guard.getState().interactionPausesCount).toBe(1)

    guard.reset()
    const state = guard.getState()
    expect(state.lastActivityTimestamp).toBe(0)
    expect(state.isPaused).toBe(false)
    expect(state.interactionPausesCount).toBe(0)
    expect(state.totalInteractionPauseMs).toBe(0)
  })
})
