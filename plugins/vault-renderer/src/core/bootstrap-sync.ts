import { createDefaultPluginConfig, isPluginActiveOnPlatform } from './platform-matrix'
import type { PlatformType, PluginProfileConfig, StartupPhase } from './types'

export interface ComputeBootstrapParams {
  readonly plugins: Record<string, PluginProfileConfig>
  readonly selfPluginId: string
  readonly installedPluginIds: readonly string[]
  readonly currentPlatform?: PlatformType | undefined
  readonly excludeSelf?: boolean | undefined
}

export function isBootstrapPhase(phase: StartupPhase): boolean {
  return phase === 'instant' || phase === 'interactive'
}

export function computeBootstrapPluginIds(params: ComputeBootstrapParams): readonly string[] {
  const { plugins, selfPluginId, installedPluginIds, currentPlatform, excludeSelf } = params
  const resultSet = new Set<string>()

  // Orchestrator plugin itself is loaded first in the bootstrap sequence unless explicitly excluded
  if (!excludeSelf) {
    resultSet.add(selfPluginId)
  }

  for (const id of installedPluginIds) {
    if (id === selfPluginId) {
      continue
    }

    const config = plugins[id] ?? createDefaultPluginConfig(id)

    // Check if plugin is allowed on current platform
    const platform = currentPlatform ?? 'desktop'
    if (!isPluginActiveOnPlatform(config, platform)) {
      continue
    }

    // Only early bootstrap phases are kept in native community-plugins.json
    if (isBootstrapPhase(config.phase)) {
      resultSet.add(id)
    }
  }

  return Array.from(resultSet)
}

export function computeFullActivePluginIds(params: ComputeBootstrapParams): readonly string[] {
  const { plugins, selfPluginId, installedPluginIds, currentPlatform, excludeSelf } = params
  const resultSet = new Set<string>()

  // Keep self in full active list unless explicitly excluded (e.g. during manual uninstall/disable)
  if (!excludeSelf) {
    resultSet.add(selfPluginId)
  }

  for (const id of installedPluginIds) {
    if (id === selfPluginId) {
      continue
    }

    const config = plugins[id] ?? createDefaultPluginConfig(id)
    const platform = currentPlatform ?? 'desktop'
    if (isPluginActiveOnPlatform(config, platform)) {
      resultSet.add(id)
    }
  }

  return Array.from(resultSet)
}

export function isBootstrapInSync(
  onDiskPlugins: readonly string[],
  expectedBootstrap: readonly string[]
): boolean {
  if (onDiskPlugins.length !== expectedBootstrap.length) {
    return false
  }

  const expectedSet = new Set(expectedBootstrap)
  return onDiskPlugins.every((id) => expectedSet.has(id))
}
