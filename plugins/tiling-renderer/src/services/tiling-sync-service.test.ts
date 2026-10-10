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

  it('keeps original note text order when syncTextOrder is false', () => {
    const service = new TilingSyncService(100, false)
    service.loadDocument('Sec 1\n\n***\n\nSec 2')

    // Tree with swapped leaves (Leaf 1 first, Leaf 0 second)
    const tree = {
      type: 'branch' as const,
      id: 'root',
      direction: 'column' as const,
      weight: 1,
      children: [
        { type: 'leaf' as const, id: 'leaf-1', sectionIndex: 1, weight: 1 },
        { type: 'leaf' as const, id: 'leaf-0', sectionIndex: 0, weight: 1 },
      ],
    }

    const serialized = service.serialize(tree)
    expect(serialized).toBe('Sec 1\n\n***\n\nSec 2')
  })

  it('reorders note text when syncTextOrder is true', () => {
    const service = new TilingSyncService(100, true)
    service.loadDocument('Sec 1\n\n***\n\nSec 2')

    const tree = {
      type: 'branch' as const,
      id: 'root',
      direction: 'column' as const,
      weight: 1,
      children: [
        { type: 'leaf' as const, id: 'leaf-1', sectionIndex: 1, weight: 1 },
        { type: 'leaf' as const, id: 'leaf-0', sectionIndex: 0, weight: 1 },
      ],
    }

    const serialized = service.serialize(tree)
    expect(serialized).toBe('Sec 2\n\n***\n\nSec 1')
  })

  it('syncSectionsToTree reorders sections in memory and re-indexes tree leaves', () => {
    const service = new TilingSyncService(100, true)
    service.loadDocument('Sec 1\n\n***\n\nSec 2')

    const tree = {
      type: 'branch' as const,
      id: 'root',
      direction: 'column' as const,
      weight: 1,
      children: [
        { type: 'leaf' as const, id: 'leaf-1', sectionIndex: 1, weight: 1 },
        { type: 'leaf' as const, id: 'leaf-0', sectionIndex: 0, weight: 1 },
      ],
    }

    const reindexedTree = service.syncSectionsToTree(tree)
    const sections = service.getSections()

    expect(sections[0]?.content).toBe('Sec 2')
    expect(sections[1]?.content).toBe('Sec 1')

    if (reindexedTree.type === 'branch') {
      const child0 = reindexedTree.children[0]
      const child1 = reindexedTree.children[1]
      expect(child0?.type === 'leaf' && child0.sectionIndex).toBe(0)
      expect(child1?.type === 'leaf' && child1.sectionIndex).toBe(1)
    }

    expect(service.serialize()).toBe('Sec 2\n\n***\n\nSec 1')
  })

  it('updates syncTextOrder via setSyncTextOrder', () => {
    const service = new TilingSyncService(100, true)
    expect(service.getSyncTextOrder()).toBe(true)
    service.setSyncTextOrder(false)
    expect(service.getSyncTextOrder()).toBe(false)
  })
})
