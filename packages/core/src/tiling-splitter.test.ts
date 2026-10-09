import { describe, expect, it } from 'vitest'
import { mergeTilingDocument, splitTilingDocument } from './tiling-splitter'

describe('tiling-splitter', () => {
  it('splits document without frontmatter and without separators into one section', () => {
    const doc = 'Single line text content'
    const result = splitTilingDocument(doc)

    expect(result.rawFrontmatter).toBe('')
    expect(result.sections).toHaveLength(1)
    expect(result.sections[0]?.content).toBe('Single line text content')
    expect(result.sections[0]?.id).toBe('section-0')
  })

  it('preserves frontmatter block cleanly and splits body by ***', () => {
    const raw = `---
orbit-tiling: true
title: Sample
---
First panel body

***

Second panel body`

    const result = splitTilingDocument(raw)

    expect(result.rawFrontmatter).toContain('orbit-tiling: true')
    expect(result.sections).toHaveLength(2)
    expect(result.sections[0]?.content).toBe('First panel body')
    expect(result.sections[1]?.content).toBe('Second panel body')
  })

  it('handles multiple *** separators with varying spaces', () => {
    const raw = `Section 1
  ***  
Section 2
***
Section 3`

    const result = splitTilingDocument(raw)

    expect(result.sections).toHaveLength(3)
    expect(result.sections[0]?.content).toBe('Section 1')
    expect(result.sections[1]?.content).toBe('Section 2')
    expect(result.sections[2]?.content).toBe('Section 3')
  })

  it('merges sections back with *** separators and frontmatter intact', () => {
    const fm = '---\norbit-tiling: true\n---\n'
    const sections = [
      { id: 'section-0', index: 0, content: 'Block 1 content' },
      { id: 'section-1', index: 1, content: 'Block 2 content' },
    ]

    const merged = mergeTilingDocument(sections, fm)

    expect(merged).toBe(`---
orbit-tiling: true
---
Block 1 content

***

Block 2 content`)
  })

  it('merges sections without frontmatter', () => {
    const sections = [
      { id: 'section-0', index: 0, content: 'Block 1' },
      { id: 'section-1', index: 1, content: 'Block 2' },
    ]

    const merged = mergeTilingDocument(sections)
    expect(merged).toBe('Block 1\n\n***\n\nBlock 2')
  })
})
