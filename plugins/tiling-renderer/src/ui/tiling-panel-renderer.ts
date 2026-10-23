import {
  type DocumentSection,
  getAllLeaves,
  reconcileTreeWithSections,
  removeLeaf,
  type SplitDirection,
  splitLeaf,
  type TileBranchNode,
  type TileLeafNode,
  type TileNode,
  updateBranchWeights,
} from '@packages/core'
import { attachInternalLinkHandler, attachSplitterDrag, CodeEditor } from '@packages/ui'
import type { TilingSyncService } from '@services/tiling-sync-service'
import type { PanelDndController } from '@ui/panel-dnd-controller'
import type { TilingLayoutHost } from '@ui/tiling-view'
import { type App, type Component, MarkdownRenderer, setIcon, type TFile } from 'obsidian'

export interface TilingPanelHost {
  readonly app: App
  readonly component: Component
  currentFile: TFile | null
  currentTree: TileNode | null
  readonly syncService: TilingSyncService
  readonly layoutHost: TilingLayoutHost
  readonly dndController: PanelDndController
  readonly panelModes: Map<string, 'preview' | 'edit'>
  readonly activeEditors: Map<string, CodeEditor>
  readonly panelElements: Map<string, HTMLElement>
  addCleanup(cleanup: () => void): void
  setActiveLeaf(leafId: string): void
  persistGeometry(): Promise<void>
  renderLayout(): void
  scheduleSave(): void
  flushSave(): Promise<void>
  saveAndRerender(): Promise<void>
}

/**
 * Handles DOM creation, split/close actions, and interaction bindings for tiling branches and panels.
 */
export class TilingPanelRenderer {
  private readonly host: TilingPanelHost

  constructor(host: TilingPanelHost) {
    this.host = host
  }

  renderNode(
    parentEl: HTMLElement,
    node: TileNode,
    sections: ReadonlyArray<DocumentSection>
  ): HTMLElement {
    return node.type === 'branch'
      ? this.renderBranch(parentEl, node, sections)
      : this.renderLeaf(parentEl, node, sections)
  }

  renderBranch(
    parentEl: HTMLElement,
    branch: TileBranchNode,
    sections: ReadonlyArray<DocumentSection>
  ): HTMLElement {
    const branchEl = parentEl.createDiv({
      cls: `orbit-tiling-branch orbit-tiling-branch-${branch.direction}`,
    })
    branchEl.style.flex = `${branch.weight} 1 0`

    const childEls: HTMLElement[] = []

    for (let i = 0; i < branch.children.length; i++) {
      const childNode = branch.children[i]
      if (!childNode) continue

      if (i > 0) {
        const isCol = branch.direction === 'column'
        const splitterCls = isCol ? 'orbit-tiling-splitter-col' : 'orbit-tiling-splitter-row'
        const splitterEl = branchEl.createDiv({ cls: splitterCls })
        const prevIdx = i - 1
        const nextIdx = i

        this.host.addCleanup(
          attachSplitterDrag({
            splitterEl,
            orientation: isCol,
            getTarget: () => {
              const prevEl = childEls[prevIdx]
              const nextEl = childEls[nextIdx]
              const prevChild = branch.children[prevIdx]
              const nextChild = branch.children[nextIdx]
              if (!prevEl || !nextEl || !prevChild || !nextChild) return null
              return {
                prevEl,
                nextEl,
                prevWeight: prevChild.weight,
                nextWeight: nextChild.weight,
              }
            },
            onResize: (newPrevWeight, newNextWeight) => {
              const currentTree = this.host.currentTree
              if (!currentTree) return
              const newWeights = branch.children.map((child, idx) => {
                if (idx === prevIdx) return newPrevWeight
                if (idx === nextIdx) return newNextWeight
                return child.weight
              })
              this.host.currentTree = updateBranchWeights(currentTree, branch.id, newWeights)
            },
            onComplete: () => {
              void this.host.persistGeometry()
            },
          })
        )
      }

      const childEl = this.renderNode(branchEl, childNode, sections)
      childEls.push(childEl)
    }

    return branchEl
  }

  renderLeaf(
    parentEl: HTMLElement,
    leaf: TileLeafNode,
    sections: ReadonlyArray<DocumentSection>
  ): HTMLElement {
    const section = sections[leaf.sectionIndex]
    const sectionContent = section?.content ?? ''
    const currentMode = this.host.panelModes.get(leaf.id) ?? 'preview'

    const panel = parentEl.createDiv({ cls: 'orbit-tiling-panel' })
    panel.style.flex = `${leaf.weight} 1 0`
    this.host.panelElements.set(leaf.id, panel)

    panel.addEventListener('pointerdown', () => {
      this.host.setActiveLeaf(leaf.id)
    })

    const header = panel.createDiv({ cls: 'orbit-tiling-panel-header' })
    header.draggable = true

    const title = header.createDiv({ cls: 'orbit-tiling-panel-title' })
    const grip = title.createSpan({ cls: 'orbit-tiling-panel-grip' })
    grip.textContent = '⠿'

    const badge = title.createSpan({
      cls: 'orbit-badge orbit-badge--success orbit-tiling-panel-badge',
    })
    badge.textContent = `#${leaf.sectionIndex + 1}`

    title.createSpan({ text: `Panel ${leaf.sectionIndex + 1}` })

    const actions = header.createDiv({ cls: 'orbit-tiling-panel-actions' })

    const toggleModeBtn = actions.createEl('button', {
      cls: 'clickable-icon orbit-tiling-mode-btn',
    })
    this.updateToggleIcon(toggleModeBtn, currentMode)

    const splitRightBtn = actions.createEl('button', { text: '|' })
    splitRightBtn.title = 'Split into column (right)'
    splitRightBtn.addEventListener('click', () => {
      void this.handleSplit(leaf.id, 'column')
    })

    const splitDownBtn = actions.createEl('button', { text: '—' })
    splitDownBtn.title = 'Split into row (down)'
    splitDownBtn.addEventListener('click', () => {
      void this.handleSplit(leaf.id, 'row')
    })

    const currentTree = this.host.currentTree
    const allLeaves = currentTree ? getAllLeaves(currentTree) : []
    if (allLeaves.length > 1) {
      const closeBtn = actions.createEl('button', { text: '×' })
      closeBtn.title = 'Close panel'
      closeBtn.addEventListener('click', () => {
        void this.handleCloseLeaf(leaf.id)
      })
    }

    this.attachDndEvents(header, panel, leaf.id)

    const bodyEl = panel.createDiv({ cls: 'orbit-tiling-panel-body' })
    this.renderLeafContent(bodyEl, leaf, currentMode, sectionContent, toggleModeBtn)

    toggleModeBtn.addEventListener('click', () => {
      const activeMode = this.host.panelModes.get(leaf.id) ?? 'preview'
      const nextMode = activeMode === 'preview' ? 'edit' : 'preview'
      this.setLeafMode(bodyEl, leaf, nextMode, toggleModeBtn)
    })

    return panel
  }

  updateToggleIcon(btn: HTMLElement, mode: 'preview' | 'edit'): void {
    btn.empty()
    if (mode === 'preview') {
      setIcon(btn, 'pencil')
      btn.title = 'Edit section (or double-click content)'
    } else {
      setIcon(btn, 'book-open')
      btn.title = 'Render markdown preview'
    }
  }

  renderLeafContent(
    bodyEl: HTMLElement,
    leaf: TileLeafNode,
    mode: 'preview' | 'edit',
    initialContent: string,
    toggleBtn: HTMLElement
  ): void {
    bodyEl.empty()

    if (mode === 'preview') {
      const previewEl = bodyEl.createDiv({
        cls: 'orbit-tiling-panel-preview markdown-rendered markdown-preview-view',
      })

      if (initialContent.trim() === '') {
        const hint = previewEl.createDiv({ cls: 'orbit-tiling-panel-empty-hint' })
        hint.textContent = 'Empty section. Double-click or click the edit icon to write.'
      } else {
        const file = this.host.currentFile
        void MarkdownRenderer.render(
          this.host.app,
          initialContent,
          previewEl,
          file?.path ?? '',
          this.host.component
        )
      }

      previewEl.addEventListener('dblclick', () => {
        this.setLeafMode(bodyEl, leaf, 'edit', toggleBtn)
      })

      this.host.addCleanup(
        attachInternalLinkHandler(
          previewEl,
          this.host.app.workspace,
          () => this.host.currentFile?.path ?? ''
        )
      )
    } else {
      const editorEl = bodyEl.createDiv({ cls: 'orbit-tiling-panel-editor-container' })
      const editor = new CodeEditor(editorEl, initialContent, {
        minimal: true,
        language: 'markdown',
        onDocChange: (newContent) => {
          this.host.syncService.updateSectionContent(leaf.sectionIndex, newContent)
          this.host.scheduleSave()
        },
      })
      this.host.activeEditors.set(leaf.id, editor)
      setTimeout(() => editor.focus(), 20)
    }
  }

  setLeafMode(
    bodyEl: HTMLElement,
    leaf: TileLeafNode,
    nextMode: 'preview' | 'edit',
    toggleBtn: HTMLElement
  ): void {
    const existingEditor = this.host.activeEditors.get(leaf.id)
    if (existingEditor) {
      const latestContent = existingEditor.getContent()
      const sectionsBefore = this.host.syncService.getSections().length
      this.host.syncService.updateSectionContent(leaf.sectionIndex, latestContent)
      existingEditor.destroy()
      this.host.activeEditors.delete(leaf.id)

      const file = this.host.currentFile
      if (file) {
        const serialized = this.host.syncService.serialize(
          this.host.currentTree,
          this.host.layoutHost.getSyncTextOrder()
        )
        this.host.syncService.loadDocument(serialized)
        const updatedSections = this.host.syncService.getSections()
        const currentTree = this.host.currentTree

        if (currentTree && updatedSections.length !== sectionsBefore) {
          this.host.currentTree = reconcileTreeWithSections(currentTree, updatedSections.length)
          void this.host.flushSave()
          void this.host.persistGeometry()
          this.host.renderLayout()
          return
        }

        this.host.scheduleSave()
      }
    }

    this.host.panelModes.set(leaf.id, nextMode)
    this.updateToggleIcon(toggleBtn, nextMode)

    const sections = this.host.syncService.getSections()
    const section = sections[leaf.sectionIndex]
    const content = section?.content ?? ''

    this.renderLeafContent(bodyEl, leaf, nextMode, content, toggleBtn)
  }

  async handleSplit(leafId: string, direction: SplitDirection): Promise<void> {
    const currentTree = this.host.currentTree
    if (!currentTree || !this.host.currentFile) return

    const sections = this.host.syncService.getSections()
    const allLeaves = getAllLeaves(currentTree)

    let assignedIndex = sections.findIndex(
      (sec) => !allLeaves.some((l) => l.sectionIndex === sec.index)
    )

    if (assignedIndex === -1) {
      const newSectionIndex = sections.length
      this.host.syncService.updateSectionContent(newSectionIndex, 'New Section')
      assignedIndex = newSectionIndex
    }

    const newLeafId = `leaf-${Date.now()}`
    this.host.panelModes.set(newLeafId, 'edit')
    this.host.currentTree = splitLeaf(
      currentTree,
      leafId,
      direction,
      assignedIndex,
      newLeafId,
      true
    )

    await this.host.saveAndRerender()
  }

  async handleCloseLeaf(leafId: string): Promise<void> {
    const currentTree = this.host.currentTree
    if (!currentTree || !this.host.currentFile) return
    const updated = removeLeaf(currentTree, leafId)
    if (updated) {
      this.host.panelModes.delete(leafId)
      const existing = this.host.activeEditors.get(leafId)
      if (existing) {
        existing.destroy()
        this.host.activeEditors.delete(leafId)
      }
      this.host.currentTree = updated
      await this.host.saveAndRerender()
    }
  }

  attachDndEvents(headerEl: HTMLElement, panelEl: HTMLElement, leafId: string): void {
    headerEl.addEventListener('dragstart', (e: DragEvent) => {
      this.host.dndController.onDragStart(e, leafId, panelEl)
    })
    panelEl.addEventListener('dragover', (e: DragEvent) => {
      this.host.dndController.onDragOver(e, leafId, panelEl)
    })
    panelEl.addEventListener('dragleave', (e: DragEvent) => {
      this.host.dndController.onDragLeave(e, panelEl)
    })
    panelEl.addEventListener('drop', (e: DragEvent) => {
      this.host.dndController.onDrop(e, leafId)
    })
    headerEl.addEventListener('dragend', () => {
      this.host.dndController.onDragEnd()
    })
  }
}
