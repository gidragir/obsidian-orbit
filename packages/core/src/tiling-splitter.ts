/**
 * Pure domain utilities for splitting and merging Markdown documents by the thematic break `***`.
 * 0% dependencies on Obsidian API, DOM, or Node.js runtime.
 */

export interface DocumentSection {
  readonly id: string
  readonly index: number
  readonly content: string
}

export interface TilingDocument {
  readonly rawFrontmatter: string
  readonly sections: ReadonlyArray<DocumentSection>
}

const SEPARATOR_REGEX = /(?:^|\r?\n)[ \t]*\*{3,}[ \t]*(?:\r?\n|$)/

const FRONTMATTER_REGEX = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/

/**
 * Splits raw Markdown text into frontmatter and sections delimited by `***`.
 */
export function splitTilingDocument(rawContent: string): TilingDocument {
  let frontmatter = ''
  let body = rawContent

  const fmMatch = FRONTMATTER_REGEX.exec(rawContent)
  if (fmMatch?.[0]) {
    frontmatter = fmMatch[0]
    body = rawContent.slice(frontmatter.length)
  }

  const rawPieces = body.split(SEPARATOR_REGEX)
  const sections: DocumentSection[] = []

  for (let i = 0; i < rawPieces.length; i++) {
    const piece = rawPieces[i] ?? ''
    sections.push({
      id: `section-${i}`,
      index: i,
      content: piece.trim(),
    })
  }

  return {
    rawFrontmatter: frontmatter,
    sections,
  }
}

/**
 * Merges sections back into a single Markdown document with `***` delimiters.
 */
export function mergeTilingDocument(
  sections: ReadonlyArray<DocumentSection>,
  rawFrontmatter = ''
): string {
  const body = sections.map((s) => s.content).join('\n\n***\n\n')

  if (!rawFrontmatter) {
    return body
  }

  const normalizedFm = rawFrontmatter.endsWith('\n') ? rawFrontmatter : `${rawFrontmatter}\n`

  return `${normalizedFm}${body}`
}
