import { describe, expect, it } from 'vitest'
import {
  extractCodeBlocks,
  extractFrontmatter,
  findMarkdownBlocks,
  parseFrontmatter,
  stripFrontmatter,
} from './markdown'

describe('parseFrontmatter', () => {
  it('parses valid frontmatter and body', () => {
    const raw = `---
title: My Note
tags: "books, reading"
status: 'active'
# comment
invalidLine
---
# Main Content
Some paragraph.`

    const { frontmatter, body } = parseFrontmatter(raw)
    expect(frontmatter).toEqual({
      title: 'My Note',
      tags: 'books, reading',
      status: 'active',
    })
    expect(body).toBe('# Main Content\nSome paragraph.')
  })

  it('handles content without frontmatter', () => {
    const raw = '# Just Markdown\nNo frontmatter here.'
    const { frontmatter, body } = parseFrontmatter(raw)
    expect(frontmatter).toEqual({})
    expect(body).toBe(raw)
  })
})

describe('extractFrontmatter and stripFrontmatter', () => {
  const content = `---
author: Alice
date: 2026-01-01
---
Body content.`

  it('extracts frontmatter object', () => {
    expect(extractFrontmatter(content)).toEqual({
      author: 'Alice',
      date: '2026-01-01',
    })
  })

  it('strips frontmatter from content', () => {
    expect(stripFrontmatter(content)).toBe('Body content.')
  })
})

describe('extractCodeBlocks and findMarkdownBlocks', () => {
  const markdown = `
# Title

\`\`\`typescript
const a = 1;
const b = 2;
\`\`\`

Some text

\`\`\`json
{ "key": "value" }
\`\`\`

\`\`\`
plain text
\`\`\`
`

  it('extracts all code blocks with line numbers', () => {
    const blocks = extractCodeBlocks(markdown)
    expect(blocks).toHaveLength(3)

    expect(blocks[0]).toEqual({
      type: 'typescript',
      content: 'const a = 1;\nconst b = 2;',
      startLine: 4,
      endLine: 7,
    })

    expect(blocks[1]?.type).toBe('json')
    expect(blocks[2]?.type).toBe('text')
  })

  it('filters markdown blocks by type', () => {
    const tsBlocks = findMarkdownBlocks(markdown, 'typescript')
    expect(tsBlocks).toHaveLength(1)
    expect(tsBlocks[0]?.type).toBe('typescript')

    const allBlocks = findMarkdownBlocks(markdown)
    expect(allBlocks).toHaveLength(3)
  })
})
