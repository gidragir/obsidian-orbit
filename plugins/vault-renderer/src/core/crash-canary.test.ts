import { describe, expect, it } from 'vitest'
import { evaluateCanaryOnStartup, markCanarySuccess, parseCanaryRecord } from './crash-canary'

describe('crash-canary pure logic', () => {
  describe('parseCanaryRecord', () => {
    it('returns default on non-object input', () => {
      expect(parseCanaryRecord(null)).toEqual({
        attemptCount: 0,
        lastBootTimestamp: 0,
        status: 'success',
      })
      expect(parseCanaryRecord('invalid')).toEqual({
        attemptCount: 0,
        lastBootTimestamp: 0,
        status: 'success',
      })
    })

    it('parses valid record properly', () => {
      const parsed = parseCanaryRecord({
        attemptCount: 2,
        lastBootTimestamp: 1000,
        status: 'in-flight',
      })
      expect(parsed).toEqual({
        attemptCount: 2,
        lastBootTimestamp: 1000,
        status: 'in-flight',
      })
    })
  })

  describe('evaluateCanaryOnStartup', () => {
    const now = 100000

    it('starts normal boot when previous was success', () => {
      const prev = { attemptCount: 0, lastBootTimestamp: now - 50000, status: 'success' as const }
      const evalResult = evaluateCanaryOnStartup(prev, now)

      expect(evalResult.shouldRecover).toBe(false)
      expect(evalResult.reason).toBe('normal')
      expect(evalResult.nextRecord.attemptCount).toBe(1)
      expect(evalResult.nextRecord.status).toBe('in-flight')
      expect(evalResult.nextRecord.lastBootTimestamp).toBe(now)
    })

    it('increments attempt count if previous boot crashed within timeout window', () => {
      const prev = { attemptCount: 1, lastBootTimestamp: now - 10000, status: 'in-flight' as const }
      const evalResult = evaluateCanaryOnStartup(prev, now, 3, 60000)

      expect(evalResult.shouldRecover).toBe(false)
      expect(evalResult.nextRecord.attemptCount).toBe(2)
      expect(evalResult.nextRecord.status).toBe('in-flight')
    })

    it('triggers recovery when crash threshold is reached', () => {
      const prev = { attemptCount: 2, lastBootTimestamp: now - 10000, status: 'in-flight' as const }
      const evalResult = evaluateCanaryOnStartup(prev, now, 3, 60000)

      expect(evalResult.shouldRecover).toBe(true)
      expect(evalResult.reason).toBe('crash-loop-exceeded')
      expect(evalResult.nextRecord.attemptCount).toBe(0)
      expect(evalResult.nextRecord.status).toBe('success')
    })

    it('resets attempt count if previous in-flight was stale (older than timeout window)', () => {
      const prev = {
        attemptCount: 2,
        lastBootTimestamp: now - 200000,
        status: 'in-flight' as const,
      }
      const evalResult = evaluateCanaryOnStartup(prev, now, 3, 60000)

      expect(evalResult.shouldRecover).toBe(false)
      expect(evalResult.nextRecord.attemptCount).toBe(1)
      expect(evalResult.nextRecord.status).toBe('in-flight')
    })
  })

  describe('markCanarySuccess', () => {
    it('resets attempts and sets status to success', () => {
      const success = markCanarySuccess(12345)
      expect(success).toEqual({
        attemptCount: 0,
        lastBootTimestamp: 12345,
        status: 'success',
      })
    })
  })
})
