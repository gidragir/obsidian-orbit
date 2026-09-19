/**
 * Pure domain utilities for path manipulation.
 * 0% dependencies on Obsidian API, DOM, or Node.js runtime.
 */

export function normalizePath(rawPath: string): string {
  const trimmed = rawPath.trim()
  if (!trimmed) {
    return ''
  }

  const isAbsolute = trimmed.startsWith('/')
  const segments = trimmed.replace(/\\/g, '/').split('/')
  const resolvedSegments: string[] = []

  for (const segment of segments) {
    if (!segment || segment === '.') {
      continue
    }
    if (segment === '..') {
      const last = resolvedSegments[resolvedSegments.length - 1]
      if (resolvedSegments.length > 0 && last !== '..') {
        resolvedSegments.pop()
      } else if (!isAbsolute) {
        resolvedSegments.push('..')
      }
      continue
    }
    resolvedSegments.push(segment)
  }

  const joined = resolvedSegments.join('/')
  if (isAbsolute) {
    return `/${joined}`
  }
  return joined
}

export function joinPaths(...segments: ReadonlyArray<string>): string {
  const validSegments = segments.map((s) => s.trim()).filter((s) => s.length > 0)

  if (validSegments.length === 0) {
    return ''
  }

  return normalizePath(validSegments.join('/'))
}

export function getBasename(filePath: string, stripExtension = false): string {
  const normalized = normalizePath(filePath)
  const lastSlashIndex = normalized.lastIndexOf('/')
  const filename = lastSlashIndex >= 0 ? normalized.slice(lastSlashIndex + 1) : normalized

  if (!stripExtension) {
    return filename
  }

  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex <= 0) {
    return filename
  }

  return filename.slice(0, lastDotIndex)
}

export function getExtension(filePath: string): string {
  const normalized = normalizePath(filePath)
  const lastSlashIndex = normalized.lastIndexOf('/')
  const filename = lastSlashIndex >= 0 ? normalized.slice(lastSlashIndex + 1) : normalized

  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex <= 0 || lastDotIndex === filename.length - 1) {
    return ''
  }

  return filename.slice(lastDotIndex + 1)
}

export function getDirname(filePath: string): string {
  const normalized = normalizePath(filePath)
  const lastSlashIndex = normalized.lastIndexOf('/')
  if (lastSlashIndex < 0) {
    return ''
  }
  if (lastSlashIndex === 0) {
    return '/'
  }
  return normalized.slice(0, lastSlashIndex)
}
