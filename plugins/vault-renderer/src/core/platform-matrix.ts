import type { PlatformType, PluginPlatformFilter, PluginProfileConfig } from './types'

export function normalizePlatformFilter(filter: unknown): PluginPlatformFilter {
  if (filter === 'desktop' || filter === 'desktop-only') {
    return 'desktop-only'
  }
  if (filter === 'mobile' || filter === 'mobile-only') {
    return 'mobile-only'
  }
  if (filter === 'disabled') {
    return 'disabled'
  }
  return 'all'
}

export function isPluginAllowedOnPlatform(
  filterOrConfig: PluginProfileConfig | PluginPlatformFilter | string | undefined,
  platform: PlatformType
): boolean {
  if (filterOrConfig === undefined || filterOrConfig === null) {
    return false
  }

  let filterStr: unknown
  if (typeof filterOrConfig === 'object') {
    if (filterOrConfig.enabled === false || filterOrConfig.filter === 'disabled') {
      return false
    }
    filterStr = filterOrConfig.filter
  } else {
    filterStr = filterOrConfig
  }

  const normalized = normalizePlatformFilter(filterStr)
  switch (normalized) {
    case 'all':
      return true
    case 'desktop-only':
      return platform === 'desktop'
    case 'mobile-only':
      return platform === 'mobile'
    case 'disabled':
      return false
  }
}

export function isPluginActiveOnPlatform(
  config: PluginProfileConfig | undefined,
  platform: PlatformType
): boolean {
  if (!config) {
    return true
  }
  return (
    config.enabled !== false &&
    config.filter !== 'disabled' &&
    isPluginAllowedOnPlatform(config, platform)
  )
}

export function shouldPluginRun(
  config: PluginProfileConfig | undefined,
  platform: PlatformType
): boolean {
  return isPluginActiveOnPlatform(config, platform)
}

export function evaluatePlatformMatrix(
  configs: Record<string, PluginProfileConfig>,
  platform: PlatformType,
  installedPluginIds: readonly string[]
): { readonly toEnable: readonly string[]; readonly toDisable: readonly string[] } {
  const toEnable: string[] = []
  const toDisable: string[] = []

  for (const id of installedPluginIds) {
    const config = configs[id]
    if (shouldPluginRun(config, platform)) {
      toEnable.push(id)
    } else {
      toDisable.push(id)
    }
  }

  return { toEnable, toDisable }
}

export function createDefaultPluginConfig(id: string): PluginProfileConfig {
  return {
    id,
    enabled: true,
    filter: 'all',
    phase: 'interactive',
    delayMs: 0,
    dependencies: [],
    syncMode: 'bidirectional',
  }
}
