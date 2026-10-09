import {
  createDefaultTree,
  type DocumentSection,
  type DropZonePosition,
  getAllLeaves,
  moveLeafToPosition,
  removeLeaf,
  type SplitDirection,
  splitLeaf,
  type TileBranchNode,
  type TileLeafNode,
  type TileNode,
  updateBranchWeights,
} from '@packages/core'
import type { TilingSyncService } from '@services/tiling-sync-service'
import type { FileLayoutState } from '@settings/settings'
import { PanelDndController } from '@ui/panel-dnd-controller'
import { PanelEditor } from '@ui/panel-editor'
import {
  ItemView,
  MarkdownRenderer,
  MarkdownView,
  setIcon,
  TFile,
  type ViewStateResult,
  type WorkspaceLeaf,
} from 'obsidian'

export const TILING_VIEW_TYPE = 'orbit-tiling-view'

export interface TilingLayoutHost {
  getLayout(filePath: string): FileLayoutState | null
  saveLayout(filePath: string, state: FileLayoutState): Promise<void>
  getGap(): number
}

export class TilingView extends ItemView {
  private currentFile: TFile | null = null
  private readonly syncService: TilingSyncService
  private readonly layoutHost: TilingLayoutHost
  private readonly dndController: PanelDndController
  private readonly activeEditors = new Map<string, PanelEditor>()
  private readonly panelModes = new Map<string, 'preview' | 'edit'>()
  private currentTree: TileNode | null = null

  constructor(leaf: WorkspaceLeaf, syncService: TilingSyncService, layoutHost: TilingLayoutHost) {
    super(leaf)
    this.syncService = syncService
    this.layoutHost = layoutHost
    this.dndController = new PanelDndController({
      onMoveToPosition: (fromId, toId, position) => {
        void this.handleMoveLeafToPosition(fromId, toId, position)
      },
    })
  }

  getViewType(): string {
    return TILING_VIEW_TYPE
  }

  getDisplayText(): string {
    return this.currentFile ? `Tiling: ${this.currentFile.basename}` : 'Tiling Renderer'
  }

  getIcon(): string {
    return 'columns-3'
  }

  getState(): Record<string, unknown> {
    return {
      file: this.currentFile?.path ?? '',
    }
  }

  async setState(state: Record<string, unknown>, result: ViewStateResult): Promise<void> {
    await super.setState(state, result)
    const filePath = typeof state.file === 'string' ? state.file : ''
    if (filePath) {
      const file = this.app.vault.getAbstractFileByPath(filePath)
      if (file instanceof TFile) {
        await this.setFile(file)
      }
    }
  }

  async setFile(file: TFile): Promise<void> {
    this.currentFile = file
    const content = await this.app.vault.read(file)
    this.syncService.loadDocument(content)

    const sections = this.syncService.getSections()
    const savedLayout = this.layoutHost.getLayout(file.path)

    if (savedLayout?.tree) {
      this.currentTree = savedLayout.tree
    } else {
      this.currentTree = createDefaultTree(sections.length)
    }

    this.renderLayout()
  }

  async onOpen(): Promise<void> {
    this.containerEl.addClass('orbit-tiling-view')
    if (this.currentFile) {
      await this.setFile(this.currentFile)
    } else {
      this.renderEmptyState()
    }
  }

  async onClose(): Promise<void> {
    if (this.currentFile) {
      await this.syncService.flushSave(this.app.vault, this.currentFile, this.currentTree)
      this.syncOpenMarkdownViews()
      await this.persistGeometry()
    }
    this.cleanupEditors()
  }

  toggleAllPanelsMode(): void {
    if (!this.currentTree) return
    const leaves = getAllLeaves(this.currentTree)
    const anyPreview = leaves.some((l) => (this.panelModes.get(l.id) ?? 'preview') === 'preview')
    const targetMode = anyPreview ? 'edit' : 'preview'
    for (const leaf of leaves) {
      this.panelModes.set(leaf.id, targetMode)
    }
    this.renderLayout()
  }

  private cleanupEditors(): void {
    for (const editor of this.activeEditors.values()) {
      editor.destroy()
    }
    this.activeEditors.clear()
  }

  private renderEmptyState(): void {
    this.cleanupEditors()
    const contentEl = this.contentEl
    contentEl.empty()

    const empty = contentEl.createDiv({ cls: 'orbit-tiling-empty' })
    empty.createDiv({
      text: 'No active note selected for Tiling Renderer.',
    })
    empty.createDiv({
      text: 'Open a markdown note and run "Tiling renderer: Open current note".',
      cls: 'text-muted',
    })
  }

  private renderLayout(): void {
    this.cleanupEditors()
    const contentEl = this.contentEl
    contentEl.empty()

    const sections = this.syncService.getSections()
    if (sections.length === 0 || !this.currentTree) {
      this.renderEmptyState()
      return
    }

    const container = contentEl.createDiv({ cls: 'orbit-tiling-container' })
    container.style.setProperty('--orbit-tiling-gap', `${this.layoutHost.getGap()}px`)

    this.renderNode(container, this.currentTree, sections)
  }

  private renderNode(
    parentEl: HTMLElement,
    node: TileNode,
    sections: ReadonlyArray<DocumentSection>
  ): HTMLElement {
    if (node.type === 'branch') {
      return this.renderBranch(parentEl, node, sections)
    }
    return this.renderLeaf(parentEl, node, sections)
  }

  private renderBranch(
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
        this.attachBranchSplitter(splitterEl, branch, childEls, i - 1, i, isCol)
      }

      const childEl = this.renderNode(branchEl, childNode, sections)
      childEls.push(childEl)
    }

    return branchEl
  }

  private attachBranchSplitter(
    splitterEl: HTMLElement,
    branch: TileBranchNode,
    childEls: HTMLElement[],
    prevIdx: number,
    nextIdx: number,
    isCol: boolean
  ): void {
    splitterEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault()
      splitterEl.addClass('is-dragging')
      document.body.style.cursor = isCol ? 'col-resize' : 'row-resize'

      const prevEl = childEls[prevIdx]
      const nextEl = childEls[nextIdx]
      const prevChild = branch.children[prevIdx]
      const nextChild = branch.children[nextIdx]

      if (!prevEl || !nextEl || !prevChild || !nextChild) return

      const prevRect = prevEl.getBoundingClientRect()
      const nextRect = nextEl.getBoundingClientRect()
      const totalDimension = isCol
        ? prevRect.width + nextRect.width
        : prevRect.height + nextRect.height

      if (totalDimension <= 0) return

      const startCoord = isCol ? e.clientX : e.clientY
      const initialPrevDimension = isCol ? prevRect.width : prevRect.height
      const totalWeight = prevChild.weight + nextChild.weight

      const onPointerMove = (moveEvt: PointerEvent) => {
        const currentCoord = isCol ? moveEvt.clientX : moveEvt.clientY
        const delta = currentCoord - startCoord
        const targetDimension = initialPrevDimension + delta

        let ratio = targetDimension / totalDimension
        if (ratio < 0.1) ratio = 0.1
        if (ratio > 0.9) ratio = 0.9

        const newPrevWeight = totalWeight * ratio
        const newNextWeight = totalWeight * (1 - ratio)

        prevEl.style.flex = `${newPrevWeight} 1 0`
        nextEl.style.flex = `${newNextWeight} 1 0`

        const newWeights = branch.children.map((child, idx) => {
          if (idx === prevIdx) return newPrevWeight
          if (idx === nextIdx) return newNextWeight
          return child.weight
        })

        if (this.currentTree) {
          this.currentTree = updateBranchWeights(this.currentTree, branch.id, newWeights)
        }
      }

      const onPointerUp = () => {
        splitterEl.removeClass('is-dragging')
        document.body.style.cursor = ''
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', onPointerUp)
        void this.persistGeometry()
      }

      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp)
    })
  }

  private renderLeaf(
    parentEl: HTMLElement,
    leaf: TileLeafNode,
    sections: ReadonlyArray<DocumentSection>
  ): HTMLElement {
    const section = sections[leaf.sectionIndex]
    const sectionContent = section?.content ?? ''
    const currentMode = this.panelModes.get(leaf.id) ?? 'preview'

    const panel = parentEl.createDiv({ cls: 'orbit-tiling-panel' })
    panel.style.flex = `${leaf.weight} 1 0`

    const header = panel.createDiv({ cls: 'orbit-tiling-panel-header' })
    header.draggable = true

    const title = header.createDiv({ cls: 'orbit-tiling-panel-title' })
    const grip = title.createSpan({ cls: 'orbit-tiling-panel-grip' })
    grip.textContent = '⠿'

    const badge = title.createSpan({ cls: 'orbit-tiling-panel-badge' })
    badge.textContent = `#${leaf.sectionIndex + 1}`

    title.createSpan({
      text: `Panel ${leaf.sectionIndex + 1}`,
    })

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

    const allLeaves = this.currentTree ? getAllLeaves(this.currentTree) : []
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
      const activeMode = this.panelModes.get(leaf.id) ?? 'preview'
      const nextMode = activeMode === 'preview' ? 'edit' : 'preview'
      this.setLeafMode(bodyEl, leaf, nextMode, toggleModeBtn)
    })

    return panel
  }

  private updateToggleIcon(btn: HTMLElement, mode: 'preview' | 'edit'): void {
    btn.empty()
    if (mode === 'preview') {
      setIcon(btn, 'pencil')
      btn.title = 'Edit section (or double-click content)'
    } else {
      setIcon(btn, 'book-open')
      btn.title = 'Render markdown preview'
    }
  }

  private renderLeafContent(
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
        void MarkdownRenderer.render(
          this.app,
          initialContent,
          previewEl,
          this.currentFile?.path ?? '',
          this
        )
      }

      previewEl.addEventListener('dblclick', () => {
        this.setLeafMode(bodyEl, leaf, 'edit', toggleBtn)
      })

      previewEl.addEventListener('click', (event: MouseEvent) => {
        const target = event.target as HTMLElement | null
        const linkEl = target?.closest('a.internal-link') as HTMLAnchorElement | null
        if (linkEl) {
          event.preventDefault()
          const href = linkEl.getAttribute('data-href') ?? linkEl.getAttribute('href')
          if (href) {
            void this.app.workspace.openLinkText(href, this.currentFile?.path ?? '', false)
          }
        }
      })
    } else {
      const editorEl = bodyEl.createDiv({ cls: 'orbit-tiling-panel-editor-container' })
      const panelEditor = new PanelEditor({
        initialContent,
        containerEl: editorEl,
        onContentChange: (newContent) => {
          this.syncService.updateSectionContent(leaf.sectionIndex, newContent)
          if (this.currentFile) {
            this.syncService.scheduleSave(this.app.vault, this.currentFile, this.currentTree)
            this.syncOpenMarkdownViews()
          }
        },
      })
      this.activeEditors.set(leaf.id, panelEditor)
      setTimeout(() => panelEditor.focus(), 20)
    }
  }

  private setLeafMode(
    bodyEl: HTMLElement,
    leaf: TileLeafNode,
    nextMode: 'preview' | 'edit',
    toggleBtn: HTMLElement
  ): void {
    const existingEditor = this.activeEditors.get(leaf.id)
    if (existingEditor) {
      const latestContent = existingEditor.getContent()
      this.syncService.updateSectionContent(leaf.sectionIndex, latestContent)
      if (this.currentFile) {
        this.syncService.scheduleSave(this.app.vault, this.currentFile, this.currentTree)
        this.syncOpenMarkdownViews()
      }
      existingEditor.destroy()
      this.activeEditors.delete(leaf.id)
    }

    this.panelModes.set(leaf.id, nextMode)
    this.updateToggleIcon(toggleBtn, nextMode)

    const sections = this.syncService.getSections()
    const section = sections[leaf.sectionIndex]
    const content = section?.content ?? ''

    this.renderLeafContent(bodyEl, leaf, nextMode, content, toggleBtn)
  }

  private attachDndEvents(headerEl: HTMLElement, panelEl: HTMLElement, leafId: string): void {
    headerEl.addEventListener('dragstart', (e: DragEvent) => {
      this.dndController.onDragStart(e, leafId, panelEl)
    })
    panelEl.addEventListener('dragover', (e: DragEvent) => {
      this.dndController.onDragOver(e, leafId, panelEl)
    })
    panelEl.addEventListener('dragleave', () => {
      this.dndController.onDragLeave(panelEl)
    })
    panelEl.addEventListener('drop', (e: DragEvent) => {
      this.dndController.onDrop(e, leafId, panelEl)
    })
    headerEl.addEventListener('dragend', () => {
      this.dndController.onDragEnd(panelEl)
    })
  }

  private async handleMoveLeafToPosition(
    fromId: string,
    toId: string,
    position: DropZonePosition
  ): Promise<void> {
    if (!this.currentTree || !this.currentFile) return
    this.currentTree = moveLeafToPosition(this.currentTree, fromId, toId, position)
    await this.syncService.flushSave(this.app.vault, this.currentFile, this.currentTree)
    this.syncOpenMarkdownViews()
    await this.persistGeometry()
    this.renderLayout()
  }

  private async handleSplit(leafId: string, direction: SplitDirection): Promise<void> {
    if (!this.currentTree || !this.currentFile) return

    const sections = this.syncService.getSections()
    const allLeaves = getAllLeaves(this.currentTree)

    let assignedIndex = sections.findIndex(
      (sec) => !allLeaves.some((l) => l.sectionIndex === sec.index)
    )

    if (assignedIndex === -1) {
      const newSectionIndex = sections.length
      this.syncService.updateSectionContent(newSectionIndex, 'New Section')
      assignedIndex = newSectionIndex
    }

    const newLeafId = `leaf-${Date.now()}`
    this.panelModes.set(newLeafId, 'edit')
    this.currentTree = splitLeaf(
      this.currentTree,
      leafId,
      direction,
      assignedIndex,
      newLeafId,
      true
    )

    await this.syncService.flushSave(this.app.vault, this.currentFile, this.currentTree)
    this.syncOpenMarkdownViews()
    await this.persistGeometry()
    this.renderLayout()
  }

  private async handleCloseLeaf(leafId: string): Promise<void> {
    if (!this.currentTree || !this.currentFile) return
    const updated = removeLeaf(this.currentTree, leafId)
    if (updated) {
      this.panelModes.delete(leafId)
      const existing = this.activeEditors.get(leafId)
      if (existing) {
        existing.destroy()
        this.activeEditors.delete(leafId)
      }
      this.currentTree = updated
      await this.syncService.flushSave(this.app.vault, this.currentFile, this.currentTree)
      this.syncOpenMarkdownViews()
      await this.persistGeometry()
      this.renderLayout()
    }
  }

  private syncOpenMarkdownViews(): void {
    if (!this.currentFile) return
    const serialized = this.syncService.serialize(this.currentTree)
    const leaves = this.app.workspace.getLeavesOfType('markdown')
    for (const leaf of leaves) {
      const view = leaf.view
      if (view instanceof MarkdownView && view.file?.path === this.currentFile.path) {
        view.setViewData(serialized, false)
      }
    }
  }

  private async persistGeometry(): Promise<void> {
    if (!this.currentFile || !this.currentTree) return
    await this.layoutHost.saveLayout(this.currentFile.path, {
      tree: this.currentTree,
    })
  }
}
