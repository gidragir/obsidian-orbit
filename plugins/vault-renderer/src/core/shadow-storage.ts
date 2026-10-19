import type { PlatformType, SyncMode } from './types'

export interface StoragePaths {
  readonly cloudPath: string
  readonly overlayPath: string
  readonly isolatedPath: string
  readonly cloudBackupPath: string
  readonly effectiveReadPath: string
  readonly effectiveWritePath: string
}

export function resolveStoragePaths(
  pluginId: string,
  syncMode: SyncMode,
  platform: PlatformType
): StoragePaths {
  const pluginDir = `.obsidian/plugins/${pluginId}`
  const cloudPath = `${pluginDir}/data.json`
  const overlayPath = `${pluginDir}/data.local.json`
  const isolatedPath = `${pluginDir}/data.${platform}.json`
  const cloudBackupPath = `${pluginDir}/data.cloud.json`

  let effectiveReadPath = cloudPath
  let effectiveWritePath = cloudPath

  if (syncMode === 'from-cloud') {
    effectiveReadPath = cloudPath
    effectiveWritePath = overlayPath
  } else if (syncMode === 'isolated') {
    effectiveReadPath = isolatedPath
    effectiveWritePath = isolatedPath
  }

  return {
    cloudPath,
    overlayPath,
    isolatedPath,
    cloudBackupPath,
    effectiveReadPath,
    effectiveWritePath,
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function deepMerge(
  base: Record<string, unknown>,
  override: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base }

  for (const [key, overrideValue] of Object.entries(override)) {
    const baseValue = base[key]
    if (isRecord(baseValue) && isRecord(overrideValue)) {
      result[key] = deepMerge(baseValue, overrideValue)
    } else {
      result[key] = overrideValue
    }
  }

  return result
}

export function calculateDiff(
  base: Record<string, unknown>,
  current: Record<string, unknown>
): Record<string, unknown> {
  const diff: Record<string, unknown> = {}

  for (const [key, currentValue] of Object.entries(current)) {
    const baseValue = base[key]
    if (baseValue === undefined) {
      diff[key] = currentValue
    } else if (isRecord(baseValue) && isRecord(currentValue)) {
      const nestedDiff = calculateDiff(baseValue, currentValue)
      if (Object.keys(nestedDiff).length > 0) {
        diff[key] = nestedDiff
      }
    } else if (JSON.stringify(baseValue) !== JSON.stringify(currentValue)) {
      diff[key] = currentValue
    }
  }

  return diff
}

export function prepareEffectiveData(
  syncMode: SyncMode,
  cloudData: Record<string, unknown> | null,
  localData: Record<string, unknown> | null
): Record<string, unknown> {
  const safeCloud = cloudData ?? {}
  const safeLocal = localData ?? {}

  switch (syncMode) {
    case 'bidirectional':
    case 'to-cloud':
      return safeCloud
    case 'from-cloud':
      return deepMerge(safeCloud, safeLocal)
    case 'isolated':
      return localData !== null ? safeLocal : safeCloud
    default:
      return safeCloud
  }
}

export function extractOverlayDiff(
  cloudData: Record<string, unknown> | null,
  currentData: Record<string, unknown>
): Record<string, unknown> {
  if (!cloudData) {
    return currentData
  }
  return calculateDiff(cloudData, currentData)
}
