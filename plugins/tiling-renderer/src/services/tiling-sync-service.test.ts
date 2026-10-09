import { describe, expect, it } from 'vitest'
import { TilingSyncService } from './tiling-sync-service'

describe('TilingSyncService', () => {
  it('loads and splits document into sections', () => {
    const service = new TilingSyncService(100)
    const raw = `---
orbit-tiling: true
---
Section 1

***

Section 2`

    service.loadDocument(raw)
    const sections = service.getSections()

    expect(sections).toHaveLength(2)
    expect(sections[0]?.content).toBe('Section 1')
    expect(sections[1]?.content).toBe('Section 2')
  })

  it('updates section content and serializes correctly', () => {
    const service = new TilingSyncService(100)
    service.loadDocument('Old 1\n\n***\n\nOld 2')

    service.updateSectionContent(0, 'Updated 1')
    const serialized = service.serialize()

    expect(serialized).toBe('Updated 1\n\n***\n\nOld 2')
  })

  it('reorders sections and updates indexes', () => {
    const service = new TilingSyncService(100)
    service.loadDocument('Block A\n\n***\n\nBlock B\n\n***\n\nBlock C')

    service.reorderSections(0, 2)
    const sections = service.getSections()

    expect(sections[0]?.content).toBe('Block B')
    expect(sections[1]?.content).toBe('Block C')
    expect(sections[2]?.content).toBe('Block A')

    expect(sections[0]?.index).toBe(0)
    expect(sections[1]?.index).toBe(1)
    expect(sections[2]?.index).toBe(2)
  })

  it('appends new section when index is out of bounds', () => {
    const service = new TilingSyncService(100)
    service.loadDocument('Block 1\n\n***\n\nBlock 2')

    service.updateSectionContent(2, 'Block 3')
    const sections = service.getSections()

    expect(sections).toHaveLength(3)
    expect(sections[2]?.content).toBe('Block 3')
    expect(service.serialize()).toBe('Block 1\n\n***\n\nBlock 2\n\n***\n\nBlock 3')
  })
})
