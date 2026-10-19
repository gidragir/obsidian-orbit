import { describe, expect, it } from 'vitest'
import {
  createDefaultPluginConfig,
  evaluatePlatformMatrix,
  isPluginActiveOnPlatform,
  isPluginAllowedOnPlatform,
  normalizePlatformFilter,
  shouldPluginRun,
} from './platform-matrix'

describe('platform-matrix', () => {
  it('correctly normalizes platform filters', () => {
    expect(normalizePlatformFilter('desktop')).toBe('desktop-only')
    expect(normalizePlatformFilter('desktop-only')).toBe('desktop-only')
    expect(normalizePlatformFilter('mobile')).toBe('mobile-only')
    expect(normalizePlatformFilter('mobile-only')).toBe('mobile-only')
    expect(normalizePlatformFilter('disabled')).toBe('disabled')
    expect(normalizePlatformFilter('all')).toBe('all')
    expect(normalizePlatformFilter('unknown-filter')).toBe('all')
  })

  it('correctly filters by platform including aliases', () => {
    expect(isPluginAllowedOnPlatform('all', 'desktop')).toBe(true)
    expect(isPluginAllowedOnPlatform('all', 'mobile')).toBe(true)
    expect(isPluginAllowedOnPlatform('desktop-only', 'desktop')).toBe(true)
    expect(isPluginAllowedOnPlatform('desktop-only', 'mobile')).toBe(false)
    expect(isPluginAllowedOnPlatform('desktop', 'desktop')).toBe(true)
    expect(isPluginAllowedOnPlatform('desktop', 'mobile')).toBe(false)
    expect(isPluginAllowedOnPlatform('mobile-only', 'desktop')).toBe(false)
    expect(isPluginAllowedOnPlatform('mobile-only', 'mobile')).toBe(true)
    expect(isPluginAllowedOnPlatform('mobile', 'desktop')).toBe(false)
    expect(isPluginAllowedOnPlatform('mobile', 'mobile')).toBe(true)
    expect(isPluginAllowedOnPlatform('disabled', 'desktop')).toBe(false)
    expect(isPluginAllowedOnPlatform('disabled', 'mobile')).toBe(false)
  })

  it('handles shouldPluginRun and isPluginActiveOnPlatform strictly', () => {
    expect(shouldPluginRun(undefined, 'desktop')).toBe(true)
    expect(isPluginActiveOnPlatform(undefined, 'desktop')).toBe(true)

    // Explicitly disabled via enabled flag
    expect(
      shouldPluginRun(
        {
          id: 'test',
          enabled: false,
          filter: 'all',
          phase: 'instant',
          delayMs: 0,
          dependencies: [],
          syncMode: 'bidirectional',
        },
        'desktop'
      )
    ).toBe(false)

    // Explicitly disabled via filter: 'disabled'
    expect(
      shouldPluginRun(
        {
          id: 'test-filter-disabled',
          enabled: true,
          filter: 'disabled',
          phase: 'instant',
          delayMs: 0,
          dependencies: [],
          syncMode: 'bidirectional',
        },
        'desktop'
      )
    ).toBe(false)

    // Platform mismatch
    expect(
      isPluginActiveOnPlatform(
        {
          id: 'test-mobile',
          enabled: true,
          filter: 'mobile-only',
          phase: 'instant',
          delayMs: 0,
          dependencies: [],
          syncMode: 'bidirectional',
        },
        'desktop'
      )
    ).toBe(false)

    // isPluginAllowedOnPlatform with config objects
    expect(isPluginAllowedOnPlatform(undefined, 'desktop')).toBe(false)
    expect(
      isPluginAllowedOnPlatform(
        {
          id: 'cfg-disabled',
          enabled: false,
          filter: 'all',
          phase: 'interactive',
          delayMs: 0,
          dependencies: [],
          syncMode: 'bidirectional',
        },
        'desktop'
      )
    ).toBe(false)
    expect(
      isPluginAllowedOnPlatform(
        {
          id: 'cfg-filter-disabled',
          enabled: true,
          filter: 'disabled',
          phase: 'interactive',
          delayMs: 0,
          dependencies: [],
          syncMode: 'bidirectional',
        },
        'desktop'
      )
    ).toBe(false)
    expect(
      isPluginAllowedOnPlatform(
        {
          id: 'cfg-desktop',
          enabled: true,
          filter: 'desktop-only',
          phase: 'interactive',
          delayMs: 0,
          dependencies: [],
          syncMode: 'bidirectional',
        },
        'desktop'
      )
    ).toBe(true)
    expect(
      isPluginAllowedOnPlatform(
        {
          id: 'cfg-desktop',
          enabled: true,
          filter: 'desktop-only',
          phase: 'interactive',
          delayMs: 0,
          dependencies: [],
          syncMode: 'bidirectional',
        },
        'mobile'
      )
    ).toBe(false)
  })

  it('evaluates platform matrix across installed plugins', () => {
    const configs = {
      p1: {
        id: 'p1',
        enabled: true,
        filter: 'desktop-only' as const,
        phase: 'instant' as const,
        delayMs: 0,
        dependencies: [],
        syncMode: 'bidirectional' as const,
      },
      p2: {
        id: 'p2',
        enabled: true,
        filter: 'mobile-only' as const,
        phase: 'interactive' as const,
        delayMs: 0,
        dependencies: [],
        syncMode: 'bidirectional' as const,
      },
      p3: {
        id: 'p3',
        enabled: true,
        filter: 'all' as const,
        phase: 'deferred' as const,
        delayMs: 0,
        dependencies: [],
        syncMode: 'bidirectional' as const,
      },
      p4: {
        id: 'p4',
        enabled: false,
        filter: 'all' as const,
        phase: 'idle' as const,
        delayMs: 0,
        dependencies: [],
        syncMode: 'bidirectional' as const,
      },
    }

    const desktopResult = evaluatePlatformMatrix(configs, 'desktop', ['p1', 'p2', 'p3', 'p4', 'p5'])
    expect(desktopResult.toEnable).toEqual(['p1', 'p3', 'p5'])
    expect(desktopResult.toDisable).toEqual(['p2', 'p4'])

    const mobileResult = evaluatePlatformMatrix(configs, 'mobile', ['p1', 'p2', 'p3', 'p4', 'p5'])
    expect(mobileResult.toEnable).toEqual(['p2', 'p3', 'p5'])
    expect(mobileResult.toDisable).toEqual(['p1', 'p4'])
  })

  it('creates clean default plugin config', () => {
    const config = createDefaultPluginConfig('sample-plugin')
    expect(config.id).toBe('sample-plugin')
    expect(config.enabled).toBe(true)
    expect(config.filter).toBe('all')
    expect(config.phase).toBe('interactive')
    expect(config.syncMode).toBe('bidirectional')
  })
})
