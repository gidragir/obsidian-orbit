/**
 * Pure domain parser for task tag strings.
 * 0% dependencies on Obsidian API, DOM, or Node.js runtime.
 */

export interface ParsedTaskTag {
  readonly raw: string
  readonly tag: string
  readonly priority: number
}

const PRIORITY_MAP: Record<string, number> = {
  urgent: 1,
  high: 2,
  normal: 3,
  low: 4,
}

export function parseTaskTag(text: string): ParsedTaskTag | null {
  const match = /#task\/([a-zA-Z0-9_-]+)/.exec(text)
  if (!match) {
    return null
  }

  const raw = match[0] ?? ''
  const tag = match[1]?.toLowerCase() ?? ''
  const priority = PRIORITY_MAP[tag] ?? 3

  return { raw, tag, priority }
}
