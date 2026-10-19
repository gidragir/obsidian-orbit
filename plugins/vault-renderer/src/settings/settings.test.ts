import { describe, expect, it } from 'vitest'
import { normalizeSettings } from './settings'

describe('settings', () => {
  it('normalizes empty settings with installed plugins', () => {
    const normalized = normalizeSettings(null, ['plugin-1', 'plugin-2'])
    expect(normalized.enableScheduler).toBe(true)
    expect(normalized.plugins['plugin-1']?.phase).toBe('interactive')
    expect(normalized.plugins['plugin-2']?.syncMode).toBe('bidirectional')
  })

  it('preserves user settings and fills in new plugins', () => {
    const raw = {
      enableScheduler: false,
      plugins: {
        'plugin-1': {
          id: 'plugin-1',
          enabled: false,
          filter: 'desktop-only' as const,
          phase: 'instant' as const,
          delayMs: 100,
          dependencies: [],
          syncMode: 'to-cloud' as const,
        },
      },
    }

    const normalized = normalizeSettings(raw, ['plugin-1', 'plugin-2'])
    expect(normalized.enableScheduler).toBe(false)
    expect(normalized.plugins['plugin-1']?.enabled).toBe(false)
    expect(normalized.plugins['plugin-1']?.phase).toBe('instant')
    expect(normalized.plugins['plugin-2']?.enabled).toBe(true)
  })

  it('preserves configs for plugins not currently installed on this device (cross-platform sync)', () => {
    const raw = {
      plugins: {
        'desktop-heavy-plugin': {
          id: 'desktop-heavy-plugin',
          enabled: true,
          filter: 'desktop-only' as const,
          phase: 'idle' as const,
          delayMs: 500,
          dependencies: [],
          syncMode: 'isolated' as const,
        },
      },
    }

    // Even if installed on current device is empty (e.g. mobile), desktop plugin config must NOT be erased
    const normalized = normalizeSettings(raw, [])
    expect(normalized.plugins['desktop-heavy-plugin']).toBeDefined()
    expect(normalized.plugins['desktop-heavy-plugin']?.filter).toBe('desktop-only')
    expect(normalized.plugins['desktop-heavy-plugin']?.syncMode).toBe('isolated')
  })

  it('normalizes legacy desktop and mobile filters to desktop-only and mobile-only', () => {
    const raw = {
      plugins: {
        'desktop-plugin': {
          id: 'desktop-plugin',
          enabled: true,
          filter: 'desktop',
        },
        'mobile-plugin': {
          id: 'mobile-plugin',
          enabled: true,
          filter: 'mobile',
        },
        'disabled-plugin': {
          id: 'disabled-plugin',
          enabled: true,
          filter: 'disabled',
        },
      },
    }

    const normalized = normalizeSettings(raw, [
      'desktop-plugin',
      'mobile-plugin',
      'disabled-plugin',
    ])
    expect(normalized.plugins['desktop-plugin']?.filter).toBe('desktop-only')
    expect(normalized.plugins['mobile-plugin']?.filter).toBe('mobile-only')
    expect(normalized.plugins['disabled-plugin']?.filter).toBe('disabled')
    expect(normalized.plugins['disabled-plugin']?.enabled).toBe(false)
  })

  it('respects obsidian disabled plugin status upon initialization', () => {
    const raw = {
      plugins: {
        'enabled-plugin': {
          id: 'enabled-plugin',
          enabled: true,
          filter: 'all' as const,
        },
        'disabled-by-user': {
          id: 'disabled-by-user',
          enabled: true,
          filter: 'desktop-only' as const,
        },
      },
    }

    // Obsidian currently only has 'enabled-plugin' in its enabled plugins set
    const currentlyEnabled = new Set(['enabled-plugin'])
    const normalized = normalizeSettings(
      raw,
      ['enabled-plugin', 'disabled-by-user', 'new-unconfigured-plugin'],
      currentlyEnabled
    )

    expect(normalized.plugins['enabled-plugin']?.enabled).toBe(true)
    expect(normalized.plugins['disabled-by-user']?.enabled).toBe(false)
    expect(normalized.plugins['new-unconfigured-plugin']?.enabled).toBe(false)
    expect(normalized.plugins['new-unconfigured-plugin']?.filter).toBe('disabled')
  })

  it('preserves mobile plugin enabled state when running normalizeSettings on desktop', () => {
    const raw = {
      plugins: {
        'mobile-tool': {
          id: 'mobile-tool',
          enabled: true,
          filter: 'mobile-only' as const,
        },
        'desktop-tool': {
          id: 'desktop-tool',
          enabled: true,
          filter: 'desktop-only' as const,
        },
        'remote-only-tool': {
          id: 'remote-only-tool',
          enabled: true,
          filter: 'all' as const,
        },
      },
    }

    // On desktop, only 'desktop-tool' is currently enabled in Obsidian
    const currentlyEnabled = new Set(['desktop-tool'])
    // 'remote-only-tool' is not even installed on this device
    const installed = ['mobile-tool', 'desktop-tool']

    const normalized = normalizeSettings(raw, installed, currentlyEnabled, 'desktop')

    // mobile-tool is not allowed on desktop, so its absence in currentlyEnabled must NOT disable it
    expect(normalized.plugins['mobile-tool']?.enabled).toBe(true)
    expect(normalized.plugins['desktop-tool']?.enabled).toBe(true)
    // remote-only-tool is not installed here, so its config must be preserved
    expect(normalized.plugins['remote-only-tool']?.enabled).toBe(true)
  })
})
