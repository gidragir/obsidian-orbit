/**
 * Safe merge utilities for plugin configuration and default settings.
 * 0% dependencies on Obsidian API, DOM, or Node.js runtime.
 */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function mergeValue(defaultValue: unknown, loadedValue: unknown): unknown {
  if (loadedValue === undefined) {
    return defaultValue
  }

  if (isPlainObject(defaultValue)) {
    if (isPlainObject(loadedValue)) {
      return mergeSettings(defaultValue, loadedValue)
    }
    return defaultValue
  }

  if (Array.isArray(defaultValue)) {
    if (Array.isArray(loadedValue)) {
      return [...loadedValue]
    }
    return defaultValue
  }

  if (typeof defaultValue === typeof loadedValue) {
    return loadedValue
  }

  return defaultValue
}

export function mergeSettings<T extends object>(defaults: T, loaded: unknown): T {
  if (!isPlainObject(loaded)) {
    return { ...defaults }
  }

  const result: Record<string, unknown> = {}
  const defaultsRecord = defaults as Record<string, unknown>

  for (const key of Object.keys(defaults)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue
    }

    const defaultValue = defaultsRecord[key]
    const loadedValue = loaded[key]

    result[key] = mergeValue(defaultValue, loadedValue)
  }

  return result as T
}
