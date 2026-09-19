/**
 * Pure domain utilities for Obsidian note manipulation and Markdown processing.
 * 0% dependencies on Obsidian API, DOM, or Node.js runtime.
 */

export interface ParsedWikiLink {
  readonly target: string
  readonly alias: string | null
}

/**
 * Formats a wiki-link string for Obsidian notes.
 */
export function formatWikiLink(target: string, alias?: string): string {
  const cleanTarget = target.trim()
  if (!alias || alias.trim().length === 0) {
    return `[[${cleanTarget}]]`
  }
  return `[[${cleanTarget}|${alias.trim()}]]`
}

/**
 * Parses a wiki-link string into its target and optional alias.
 */
export function parseWikiLink(raw: string): ParsedWikiLink | null {
  const match = /^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/.exec(raw.trim())
  if (!match) {
    return null
  }

  const target = match[1]?.trim() ?? ''
  const alias = match[2]?.trim() ?? null

  return { target, alias }
}

/**
 * Sanitizes a file name removing characters forbidden in Obsidian vault files.
 */
export function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '-').trim()
}

/**
 * Parses simple YAML-like key-value frontmatter into a typed dictionary.
 */
export function parseKeyValueFrontmatter(raw: string): Record<string, string> {
  const result: Record<string, string> = {}
  const lines = raw.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const colonIndex = trimmed.indexOf(':')
    if (colonIndex <= 0) {
      continue
    }

    const key = trimmed.slice(0, colonIndex).trim()
    const value = trimmed.slice(colonIndex + 1).trim()
    if (key.length > 0) {
      result[key] = value
    }
  }

  return result
}
