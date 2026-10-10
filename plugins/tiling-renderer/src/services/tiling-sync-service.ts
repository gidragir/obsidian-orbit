import {
  type DocumentSection,
  getAllLeaves,
  mergeTilingDocument,
  reindexTreeLeaves,
  reorderArray,
  splitTilingDocument,
  type TileNode,
  type TilingDocument,
} from '@packages/core'

/**
 * Pure domain store managing tiled markdown document sections and serialization.
 * 0% dependencies on Obsidian API, DOM, or timers.
 */
export class TilingSyncService {
  private document: TilingDocument = {
    rawFrontmatter: '',
    sections: [],
  }
  private syncTextOrder: boolean

  constructor(debounceOrSync?: number | boolean, syncTextOrder = true) {
    if (typeof debounceOrSync === 'boolean') {
      this.syncTextOrder = debounceOrSync
    } else {
      this.syncTextOrder = syncTextOrder
    }
  }

  setSyncTextOrder(syncTextOrder: boolean): void {
    this.syncTextOrder = syncTextOrder
  }

  getSyncTextOrder(): boolean {
    return this.syncTextOrder
  }

  loadDocument(rawContent: string): TilingDocument {
    this.document = splitTilingDocument(rawContent)
    return this.document
  }

  getDocument(): TilingDocument {
    return this.document
  }

  getSections(): ReadonlyArray<DocumentSection> {
    return this.document.sections
  }

  updateSectionContent(sectionIndex: number, content: string): void {
    const sections = [...this.document.sections]
    if (sectionIndex >= sections.length) {
      while (sections.length < sectionIndex) {
        sections.push({
          id: `section-${sections.length}`,
          index: sections.length,
          content: '',
        })
      }
      sections.push({
        id: `section-${sectionIndex}`,
        index: sectionIndex,
        content,
      })
    } else {
      const existing = sections[sectionIndex]
      sections[sectionIndex] = {
        id: existing?.id ?? `section-${sectionIndex}`,
        index: sectionIndex,
        content,
      }
    }

    this.document = {
      rawFrontmatter: this.document.rawFrontmatter,
      sections,
    }
  }

  reorderSections(fromIndex: number, toIndex: number): void {
    const reordered = reorderArray(this.document.sections, fromIndex, toIndex)
    const reindexed = reordered.map((sec, idx) => ({
      id: sec.id,
      index: idx,
      content: sec.content,
    }))

    this.document = {
      rawFrontmatter: this.document.rawFrontmatter,
      sections: reindexed,
    }
  }

  syncSectionsToTree(tree: TileNode): TileNode {
    const leaves = getAllLeaves(tree)
    const orderedSections = leaves.map((leaf, idx) => {
      const sec = this.document.sections[leaf.sectionIndex]
      return {
        id: `section-${idx}`,
        index: idx,
        content: sec?.content ?? '',
      }
    })

    this.document = {
      rawFrontmatter: this.document.rawFrontmatter,
      sections: orderedSections,
    }

    return reindexTreeLeaves(tree)
  }

  serialize(tree?: TileNode | null, syncTextOrder = this.syncTextOrder): string {
    if (!tree || !syncTextOrder) {
      return mergeTilingDocument(this.document.sections, this.document.rawFrontmatter)
    }

    const leaves = getAllLeaves(tree)
    const orderedSections = leaves.map((leaf, idx) => {
      const sec = this.document.sections[leaf.sectionIndex]
      return {
        id: `section-${idx}`,
        index: idx,
        content: sec?.content ?? '',
      }
    })

    return mergeTilingDocument(orderedSections, this.document.rawFrontmatter)
  }
}
