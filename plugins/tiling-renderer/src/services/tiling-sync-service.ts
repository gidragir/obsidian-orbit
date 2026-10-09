import {
  type DocumentSection,
  getAllLeaves,
  mergeTilingDocument,
  splitTilingDocument,
  type TileNode,
  type TilingDocument,
} from '@packages/core'
import type { TFile, Vault } from 'obsidian'

export class TilingSyncService {
  private document: TilingDocument = {
    rawFrontmatter: '',
    sections: [],
  }
  private saveTimeout: ReturnType<typeof setTimeout> | null = null
  private readonly debounceMs: number

  constructor(debounceMs = 500) {
    this.debounceMs = debounceMs
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
    if (
      fromIndex < 0 ||
      fromIndex >= this.document.sections.length ||
      toIndex < 0 ||
      toIndex >= this.document.sections.length ||
      fromIndex === toIndex
    ) {
      return
    }

    const currentSections = [...this.document.sections]
    const item = currentSections[fromIndex]
    if (!item) {
      return
    }

    currentSections.splice(fromIndex, 1)
    currentSections.splice(toIndex, 0, item)

    const reindexed = currentSections.map((sec, idx) => ({
      id: sec.id,
      index: idx,
      content: sec.content,
    }))

    this.document = {
      rawFrontmatter: this.document.rawFrontmatter,
      sections: reindexed,
    }
  }

  serialize(tree?: TileNode | null): string {
    if (!tree) {
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

  scheduleSave(vault: Vault, file: TFile, tree?: TileNode | null): void {
    if (this.saveTimeout !== null) {
      clearTimeout(this.saveTimeout)
    }

    this.saveTimeout = setTimeout(async () => {
      const serialized = this.serialize(tree)
      await vault.modify(file, serialized)
      this.saveTimeout = null
    }, this.debounceMs)
  }

  async flushSave(vault: Vault, file: TFile, tree?: TileNode | null): Promise<void> {
    if (this.saveTimeout !== null) {
      clearTimeout(this.saveTimeout)
      this.saveTimeout = null
    }
    const serialized = this.serialize(tree)
    await vault.modify(file, serialized)
  }

  dispose(): void {
    if (this.saveTimeout !== null) {
      clearTimeout(this.saveTimeout)
      this.saveTimeout = null
    }
  }
}
