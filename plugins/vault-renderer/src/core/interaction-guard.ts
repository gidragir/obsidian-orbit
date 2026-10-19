export interface InteractionGuardState {
  readonly lastActivityTimestamp: number
  readonly isPaused: boolean
  readonly pauseStartTimestamp: number
  readonly interactionPausesCount: number
  readonly totalInteractionPauseMs: number
}

export class InteractionGuardCore {
  private lastActivity = 0
  private isPausedState = false
  private pauseStart = 0
  private pauseCount = 0
  private accumulatedPauseMs = 0

  recordActivity(timestamp: number): void {
    this.lastActivity = timestamp
  }

  getLastActivity(): number {
    return this.lastActivity
  }

  isBusy(now: number, debounceMs: number): boolean {
    if (this.lastActivity === 0) {
      return false
    }
    return now - this.lastActivity < debounceMs
  }

  getRemainingBusyTime(now: number, debounceMs: number): number {
    if (this.lastActivity === 0) {
      return 0
    }
    const elapsed = now - this.lastActivity
    const remaining = debounceMs - elapsed
    return remaining > 0 ? remaining : 0
  }

  startPause(now: number): void {
    if (!this.isPausedState) {
      this.isPausedState = true
      this.pauseStart = now
      this.pauseCount += 1
    }
  }

  resume(now: number): void {
    if (this.isPausedState) {
      this.isPausedState = false
      if (this.pauseStart > 0 && now >= this.pauseStart) {
        this.accumulatedPauseMs += now - this.pauseStart
      }
      this.pauseStart = 0
    }
  }

  getState(): InteractionGuardState {
    return {
      lastActivityTimestamp: this.lastActivity,
      isPaused: this.isPausedState,
      pauseStartTimestamp: this.pauseStart,
      interactionPausesCount: this.pauseCount,
      totalInteractionPauseMs: this.accumulatedPauseMs,
    }
  }

  reset(): void {
    this.lastActivity = 0
    this.isPausedState = false
    this.pauseStart = 0
    this.pauseCount = 0
    this.accumulatedPauseMs = 0
  }
}
