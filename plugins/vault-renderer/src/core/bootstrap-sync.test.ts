import { describe, expect, it } from 'vitest'
import {
  computeBootstrapPluginIds,
  computeFullActivePluginIds,
  isBootstrapInSync,
  isBootstrapPhase,
} from './bootstrap-sync'
import type { PluginProfileConfig } from './types'

describe('bootstrap-sync pure core', () => {
  const selfPluginId = 'vault-renderer'

  const mockPlugins: Record<string, PluginProfileConfig> = {
    'plugin-instant': {
      id: 'plugin-instant',
      enabled: true,
      filter: 'all',
      phase: 'instant',
      delayMs: 0,
      dependencies: [],
      syncMode: 'bidirectional',
    },
    'plugin-interactive': {
      id: 'plugin-interactive',
      enabled: true,
      filter: 'all',
      phase: 'interactive',
      delayMs: 0,
      dependencies: [],
      syncMode: 'bidirectional',
    },
    'plugin-deferred': {
      id: 'plugin-deferred',
      enabled: true,
      filter: 'all',
      phase: 'deferred',
      delayMs: 500,
      dependencies: [],
      syncMode: 'bidirectional',
    },
    'plugin-idle': {
      id: 'plugin-idle',
      enabled: true,
      filter: 'all',
      phase: 'idle',
      delayMs: 1000,
      dependencies: [],
      syncMode: 'bidirectional',
    },
    'plugin-disabled': {
      id: 'plugin-disabled',
      enabled: false,
      filter: 'all',
      phase: 'interactive',
      delayMs: 0,
      dependencies: [],
      syncMode: 'bidirectional',
    },
    'plugin-desktop-only': {
      id: 'plugin-desktop-only',
      enabled: true,
      filter: 'desktop-only',
      phase: 'instant',
      delayMs: 0,
      dependencies: [],
      syncMode: 'bidirectional',
    },
    'plugin-mobile-only': {
      id: 'plugin-mobile-only',
      enabled: true,
      filter: 'mobile-only',
      phase: 'interactive',
      delayMs: 0,
      dependencies: [],
      syncMode: 'bidirectional',
    },
  }

  const installedPluginIds = [
    'vault-renderer',
    'plugin-instant',
    'plugin-interactive',
    'plugin-deferred',
    'plugin-idle',
    'plugin-disabled',
    'plugin-desktop-only',
    'plugin-mobile-only',
    'plugin-unconfigured',
  ]

  describe('isBootstrapPhase', () => {
    it('returns true for instant and interactive', () => {
      expect(isBootstrapPhase('instant')).toBe(true)
      expect(isBootstrapPhase('interactive')).toBe(true)
    })

    it('returns false for deferred and idle', () => {
      expect(isBootstrapPhase('deferred')).toBe(false)
      expect(isBootstrapPhase('idle')).toBe(false)
    })
  })

  describe('computeBootstrapPluginIds', () => {
    it('always includes selfPluginId as the first element', () => {
      const result = computeBootstrapPluginIds({
        plugins: mockPlugins,
        selfPluginId,
        installedPluginIds,
        currentPlatform: 'desktop',
      })

      expect(result[0]).toBe('vault-renderer')
    })

    it('includes instant and interactive plugins, and excludes deferred and idle on desktop', () => {
      const result = computeBootstrapPluginIds({
        plugins: mockPlugins,
        selfPluginId,
        installedPluginIds,
        currentPlatform: 'desktop',
      })

      expect(result).toContain('vault-renderer')
      expect(result).toContain('plugin-instant')
      expect(result).toContain('plugin-interactive')
      expect(result).toContain('plugin-desktop-only')
      expect(result).toContain('plugin-unconfigured') // defaults to interactive

      // Heavy phases excluded
      expect(result).not.toContain('plugin-deferred')
      expect(result).not.toContain('plugin-idle')

      // Disabled or wrong platform excluded
      expect(result).not.toContain('plugin-disabled')
      expect(result).not.toContain('plugin-mobile-only')
    })

    it('respects mobile platform filter', () => {
      const result = computeBootstrapPluginIds({
        plugins: mockPlugins,
        selfPluginId,
        installedPluginIds,
        currentPlatform: 'mobile',
      })

      expect(result).toContain('vault-renderer')
      expect(result).toContain('plugin-instant')
      expect(result).toContain('plugin-mobile-only')
      expect(result).not.toContain('plugin-desktop-only')
      expect(result).not.toContain('plugin-deferred')
    })

    it('handles empty installed list by still returning selfPluginId', () => {
      const result = computeBootstrapPluginIds({
        plugins: {},
        selfPluginId,
        installedPluginIds: [],
        currentPlatform: 'desktop',
      })

      expect(result).toEqual(['vault-renderer'])
    })

    it('excludes selfPluginId when excludeSelf is true (manual uninstall/disable)', () => {
      const result = computeBootstrapPluginIds({
        plugins: mockPlugins,
        selfPluginId,
        installedPluginIds,
        currentPlatform: 'desktop',
        excludeSelf: true,
      })

      expect(result).not.toContain('vault-renderer')
      expect(result).toContain('plugin-instant')
    })
  })

  describe('computeFullActivePluginIds', () => {
    it('includes all phases (instant, interactive, deferred, idle) for active plugins', () => {
      const result = computeFullActivePluginIds({
        plugins: mockPlugins,
        selfPluginId,
        installedPluginIds,
        currentPlatform: 'desktop',
      })

      expect(result).toContain('vault-renderer')
      expect(result).toContain('plugin-instant')
      expect(result).toContain('plugin-interactive')
      expect(result).toContain('plugin-deferred')
      expect(result).toContain('plugin-idle')
      expect(result).toContain('plugin-desktop-only')
      expect(result).toContain('plugin-unconfigured')

      // Disabled and mobile-only excluded
      expect(result).not.toContain('plugin-disabled')
      expect(result).not.toContain('plugin-mobile-only')
    })

    it('excludes selfPluginId when excludeSelf is true during manual plugin unload', () => {
      const result = computeFullActivePluginIds({
        plugins: mockPlugins,
        selfPluginId,
        installedPluginIds,
        currentPlatform: 'desktop',
        excludeSelf: true,
      })

      expect(result).not.toContain('vault-renderer')
      expect(result).toContain('plugin-instant')
      expect(result).toContain('plugin-deferred')
    })
  })

  describe('isBootstrapInSync', () => {
    it('returns true when sets match', () => {
      expect(isBootstrapInSync(['a', 'b'], ['b', 'a'])).toBe(true)
      expect(isBootstrapInSync(['a', 'b'], ['a', 'b'])).toBe(true)
    })

    it('returns false when lengths differ', () => {
      expect(isBootstrapInSync(['a'], ['a', 'b'])).toBe(false)
    })

    it('returns false when elements differ', () => {
      expect(isBootstrapInSync(['a', 'c'], ['a', 'b'])).toBe(false)
    })
  })
})
