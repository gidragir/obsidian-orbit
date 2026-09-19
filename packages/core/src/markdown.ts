/**
 * Pure domain utilities for Markdown content parsing and extraction.
 * 0% dependencies on Obsidian API, DOM, or Node.js runtime.
 */

export interface ParsedFrontmatter {
  readonly frontmatter: Record<string, string>
  readonly body: string
}

export interface MarkdownBlock {
  readonly type: string
  readonly content: string
  readonly startLine: number
  readonly endLine: number
}

function parseYamlKeyValues(raw: string): Record<string, string> {
  const result: Record<string, string> = {}
  const lines = raw.split(/\r?\n/)

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
    let value = trimmed.slice(colonIndex + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (key.length > 0) {
      result[key] = value
    }
  }

  return result
}

export function parseFrontmatter(content: string): ParsedFrontmatter {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(content)
  if (!match) {
    return { frontmatter: {}, body: content }
  }

  const rawYaml = match[1] ?? ''
  const body = match[2] ?? ''
  const frontmatter = parseYamlKeyValues(rawYaml)

  return { frontmatter, body }
}

export function extractFrontmatter(content: string): Record<string, string> {
  return parseFrontmatter(content).frontmatter
}

export function stripFrontmatter(content: string): string {
  return parseFrontmatter(content).body
}

export function extractCodeBlocks(content: string): ReadonlyArray<MarkdownBlock> {
  const blocks: MarkdownBlock[] = []
  const lines = content.split(/\r?\n/)
  let inBlock = false
  let language = ''
  let startLine = 0
  let blockLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (line.startsWith('```')) {
      if (!inBlock) {
        inBlock = true
        language = line.slice(3).trim()
        startLine = i + 1
        blockLines = []
      } else {
        inBlock = false
        blocks.push({
          type: language || 'text',
          content: blockLines.join('\n'),
          startLine,
          endLine: i + 1,
        })
      }
    } else if (inBlock) {
      blockLines.push(line)
    }
  }

  return blocks
}

export function findMarkdownBlocks(
  content: string,
  blockType?: string
): ReadonlyArray<MarkdownBlock> {
  const codeBlocks = extractCodeBlocks(content)
  if (!blockType) {
    return codeBlocks
  }
  return codeBlocks.filter((b) => b.type.toLowerCase() === blockType.toLowerCase())
}
