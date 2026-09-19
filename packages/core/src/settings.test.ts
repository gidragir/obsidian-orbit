import { describe, expect, it } from 'vitest'
import { mergeSettings } from './settings'

describe('mergeSettings', () => {
  interface PluginConfig {
    readonly enabled: boolean
    readonly count: number
    readonly title: string
    readonly tags: ReadonlyArray<string>
    readonly nested: {
      readonly mode: string
      readonly retries: number
    }
  }

  const defaultSettings: PluginConfig = {
    enabled: true,
    count: 10,
    title: 'Orbit',
    tags: ['default'],
    nested: {
      mode: 'auto',
      retries: 3,
    },
  }

  it('returns default copy when loaded is invalid or non-object', () => {
    expect(mergeSettings(defaultSettings, null)).toEqual(defaultSettings)
    expect(mergeSettings(defaultSettings, undefined)).toEqual(defaultSettings)
    expect(mergeSettings(defaultSettings, 'not-an-object')).toEqual(defaultSettings)
    expect(mergeSettings(defaultSettings, [1, 2, 3])).toEqual(defaultSettings)
  })

  it('safely merges partial values', () => {
    const loaded = {
      title: 'Custom Orbit',
      count: 42,
    }
    const result = mergeSettings(defaultSettings, loaded)
    expect(result.title).toBe('Custom Orbit')
    expect(result.count).toBe(42)
    expect(result.enabled).toBe(true)
    expect(result.tags).toEqual(['default'])
  })

  it('recursively merges nested objects', () => {
    const loaded = {
      nested: {
        retries: 5,
      },
    }
    const result = mergeSettings(defaultSettings, loaded)
    expect(result.nested.mode).toBe('auto')
    expect(result.nested.retries).toBe(5)
  })

  it('overwrites array values when loaded is an array', () => {
    const loaded = {
      tags: ['custom-tag'],
    }
    const result = mergeSettings(defaultSettings, loaded)
    expect(result.tags).toEqual(['custom-tag'])
  })

  it('ignores type-mismatched fields and preserves defaults', () => {
    const loaded = {
      enabled: 'should-be-boolean',
      count: 'not-a-number',
    }
    const result = mergeSettings(defaultSettings, loaded)
    expect(result.enabled).toBe(true)
    expect(result.count).toBe(10)
  })

  it('protects against prototype pollution', () => {
    const maliciousPayload = JSON.parse('{"__proto__":{"polluted":"yes"},"title":"Safe"}')
    const result = mergeSettings(defaultSettings, maliciousPayload)
    expect(result.title).toBe('Safe')
    expect((Object.prototype as Record<string, unknown>).polluted).toBeUndefined()
  })
})
