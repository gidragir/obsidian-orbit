export interface CanaryRecord {
  readonly attemptCount: number
  readonly lastBootTimestamp: number
  readonly status: 'in-flight' | 'success'
}

export interface CanaryEvaluation {
  readonly shouldRecover: boolean
  readonly reason: 'crash-loop-exceeded' | 'normal'
  readonly nextRecord: CanaryRecord
}

export const CANARY_STORAGE_KEY = 'vault-renderer:crash-canary'
export const DEFAULT_CANARY_THRESHOLD = 3
export const DEFAULT_CRASH_TIMEOUT_MS = 60000 // 60 seconds

export function parseCanaryRecord(raw: unknown): CanaryRecord {
  if (typeof raw !== 'object' || raw === null) {
    return { attemptCount: 0, lastBootTimestamp: 0, status: 'success' }
  }
  const obj = raw as Record<string, unknown>
  const attemptCount = typeof obj.attemptCount === 'number' ? obj.attemptCount : 0
  const lastBootTimestamp = typeof obj.lastBootTimestamp === 'number' ? obj.lastBootTimestamp : 0
  const status = obj.status === 'in-flight' ? 'in-flight' : 'success'
  return { attemptCount, lastBootTimestamp, status }
}

export function evaluateCanaryOnStartup(
  previousRecord: CanaryRecord,
  now: number,
  threshold = DEFAULT_CANARY_THRESHOLD,
  timeoutMs = DEFAULT_CRASH_TIMEOUT_MS
): CanaryEvaluation {
  if (previousRecord.status === 'in-flight') {
    const timeSinceLastBoot = now - previousRecord.lastBootTimestamp
    const isRecentCrash = timeSinceLastBoot >= 0 && timeSinceLastBoot < timeoutMs
    const nextAttempts = isRecentCrash ? previousRecord.attemptCount + 1 : 1

    if (nextAttempts >= threshold) {
      return {
        shouldRecover: true,
        reason: 'crash-loop-exceeded',
        nextRecord: {
          attemptCount: 0,
          lastBootTimestamp: now,
          status: 'success',
        },
      }
    }

    return {
      shouldRecover: false,
      reason: 'normal',
      nextRecord: {
        attemptCount: nextAttempts,
        lastBootTimestamp: now,
        status: 'in-flight',
      },
    }
  }

  return {
    shouldRecover: false,
    reason: 'normal',
    nextRecord: {
      attemptCount: 1,
      lastBootTimestamp: now,
      status: 'in-flight',
    },
  }
}

export function markCanarySuccess(now: number): CanaryRecord {
  return {
    attemptCount: 0,
    lastBootTimestamp: now,
    status: 'success',
  }
}
