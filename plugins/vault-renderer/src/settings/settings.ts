import type {
  PlatformType,
  PluginProfileConfig,
  StartupPhase,
  VaultRendererSettings,
} from '@core/types'
import {
  createDefaultPluginConfig,
  isPluginAllowedOnPlatform,
  normalizePlatformFilter,
} from '../core/platform-matrix'

export const DEFAULT_SETTINGS: VaultRendererSettings = {
  enableScheduler: true,
  enablePlatformFilter: true,
  enableShadowStorage: true,
  enableTelemetry: true,
  enableBootstrapSync: true,
  interactionGuardTimeoutMs: 1500,
  deferredPhaseDelayMs: 800,
  idlePhaseDelayMs: 2500,
  plugins: {},
  telemetryHistory: [],
}

function parseBoolean(val: unknown, fallback: boolean): boolean {
  return typeof val === 'boolean' ? val : fallback
}

function parseNumber(val: unknown, fallback: number): number {
  return typeof val === 'number' ? val : fallback
}

function normalizeStoredPluginConfig(
  id: string,
  rawConfig: unknown,
  installedPluginIds: readonly string[],
  currentlyEnabledPluginIds?: ReadonlySet<string>,
  currentPlatform?: PlatformType
): PluginProfileConfig {
  const rawObj =
    typeof rawConfig === 'object' && rawConfig !== null
      ? (rawConfig as Record<string, unknown>)
      : {}
  const defaultConfig = createDefaultPluginConfig(id)
  const normalizedFilter = normalizePlatformFilter(rawObj.filter ?? defaultConfig.filter)
  let enabled = parseBoolean(rawObj.enabled, defaultConfig.enabled)

  const isInstalledHere = installedPluginIds.includes(id)
  const isAllowedHere = currentPlatform
    ? isPluginAllowedOnPlatform(normalizedFilter, currentPlatform)
    : true

  const phase = (rawObj.phase as StartupPhase | undefined) ?? defaultConfig.phase
  const isDeferredOrIdle = phase === 'deferred' || phase === 'idle'

  if (
    normalizedFilter === 'disabled' ||
    (!isDeferredOrIdle &&
      currentlyEnabledPluginIds &&
      isInstalledHere &&
      isAllowedHere &&
      !currentlyEnabledPluginIds.has(id))
  ) {
    enabled = false
  }

  return {
    ...defaultConfig,
    ...rawObj,
    id,
    enabled,
    filter: normalizedFilter,
  }
}

function createMissingPluginConfig(
  id: string,
  currentlyEnabledPluginIds?: ReadonlySet<string>
): PluginProfileConfig {
  const isEnabled = currentlyEnabledPluginIds ? currentlyEnabledPluginIds.has(id) : true
  return {
    ...createDefaultPluginConfig(id),
    enabled: isEnabled,
    filter: isEnabled ? 'all' : 'disabled',
  }
}

function mergePluginConfigs(
  rawPlugins: unknown,
  installedPluginIds: readonly string[],
  currentlyEnabledPluginIds?: ReadonlySet<string>,
  currentPlatform?: PlatformType
): Record<string, PluginProfileConfig> {
  const merged: Record<string, PluginProfileConfig> = {}
  const source =
    typeof rawPlugins === 'object' && rawPlugins !== null
      ? (rawPlugins as Record<string, unknown>)
      : {}

  // 1. Preserve and normalize all existing configurations
  for (const [id, rawConfig] of Object.entries(source)) {
    merged[id] = normalizeStoredPluginConfig(
      id,
      rawConfig,
      installedPluginIds,
      currentlyEnabledPluginIds,
      currentPlatform
    )
  }

  // 2. Ensure every currently installed plugin has a configuration entry
  for (const id of installedPluginIds) {
    if (!merged[id]) {
      merged[id] = createMissingPluginConfig(id, currentlyEnabledPluginIds)
    }
  }

  return merged
}

export function normalizeSettings(
  loaded: unknown,
  installedPluginIds: readonly string[],
  currentlyEnabledPluginIds?: ReadonlySet<string>,
  currentPlatform?: PlatformType
): VaultRendererSettings {
  if (typeof loaded !== 'object' || loaded === null) {
    return {
      ...DEFAULT_SETTINGS,
      plugins: mergePluginConfigs(
        null,
        installedPluginIds,
        currentlyEnabledPluginIds,
        currentPlatform
      ),
    }
  }

  const raw = loaded as Record<string, unknown>

  return {
    enableScheduler: parseBoolean(raw.enableScheduler, DEFAULT_SETTINGS.enableScheduler),
    enablePlatformFilter: parseBoolean(
      raw.enablePlatformFilter,
      DEFAULT_SETTINGS.enablePlatformFilter
    ),
    enableShadowStorage: parseBoolean(
      raw.enableShadowStorage,
      DEFAULT_SETTINGS.enableShadowStorage
    ),
    enableTelemetry: parseBoolean(raw.enableTelemetry, DEFAULT_SETTINGS.enableTelemetry),
    enableBootstrapSync: parseBoolean(
      raw.enableBootstrapSync,
      DEFAULT_SETTINGS.enableBootstrapSync
    ),
    interactionGuardTimeoutMs: parseNumber(
      raw.interactionGuardTimeoutMs,
      DEFAULT_SETTINGS.interactionGuardTimeoutMs
    ),
    deferredPhaseDelayMs: parseNumber(
      raw.deferredPhaseDelayMs,
      DEFAULT_SETTINGS.deferredPhaseDelayMs
    ),
    idlePhaseDelayMs: parseNumber(raw.idlePhaseDelayMs, DEFAULT_SETTINGS.idlePhaseDelayMs),
    plugins: mergePluginConfigs(
      raw.plugins,
      installedPluginIds,
      currentlyEnabledPluginIds,
      currentPlatform
    ),
    telemetryHistory: Array.isArray(raw.telemetryHistory) ? raw.telemetryHistory : [],
  }
}
