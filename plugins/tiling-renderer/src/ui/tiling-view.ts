import { DebouncedWorkspaceFileAdapter } from '@packages/adapters'
import {
  createDefaultTree,
  type Direction,
  type DropZonePosition,
  findAdjacentLeaf,
  getAllLeaves,
  moveLeafToPosition,
  reconcileTreeWithSections,
  resizeLeafInDirection,
  type SplitDirection,
  swapLeavesById,
  type TileNode,
} from '@packages/core'
import type { CodeEditor } from '@packages/ui'
import type { TilingSyncService } from '@services/tiling-sync-service'
import type { FileLayoutState } from '@settings/settings'
import { PanelDndController } from '@ui/panel-dnd-controller'
import { type TilingPanelHost, TilingPanelRenderer } from '@ui/tiling-panel-renderer'
import { type Component, ItemView, TFile, type ViewStateResult, type WorkspaceLeaf } from 'obsidian'

export const TILING_VIEW_TYPE = 'orbit-tiling-view'

export interface TilingLayoutHost {
  getLayout(filePath: string): FileLayoutState | null
  saveLayout(filePath: string, state: FileLayoutState): Promise<void>
  getGap(): number
  getSyncTextOrder(): boolean
}

export class TilingView extends ItemView implements TilingPanelHost {
  currentFile: TFile | null = null
  currentTree: TileNode | null = null
  readonly syncService: TilingSyncService
  readonly layoutHost: TilingLayoutHost
  readonly dndController: PanelDndController
  readonly activeEditors = new Map<string, CodeEditor>()
  readonly panelModes = new Map<string, 'preview' | 'edit'>()
  readonly panelElements = new Map<string, HTMLElement>()
  private readonly fileAdapter: DebouncedWorkspaceFileAdapter
  private readonly panelRenderer: TilingPanelRenderer
  private cleanups: (() => void)[] = []
  private activeLeafId: string | null = null

  constructor(leaf: WorkspaceLeaf, syncService: TilingSyncService, layoutHost: TilingLayoutHost) {
    super(leaf)
    this.syncService = syncService
    this.layoutHost = layoutHost
    this.fileAdapter = new DebouncedWorkspaceFileAdapter(this.app)
    this.dndController = new PanelDndController({
      onMoveToPosition: (fromId, toId, position) => {
        void this.handleMoveLeafToPosition(fromId, toId, position)
      },
    })
    this.panelRenderer = new TilingPanelRenderer(this)
  }

  get component(): Component {
    return this
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
    return { file: this.currentFile?.path ?? '' }
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
    if (this.currentFile && this.currentFile.path !== file.path) {
      await this.flushSave()
      await this.persistGeometry()
    }

    this.currentFile = file
    const content = await this.app.vault.read(file)
    this.syncService.loadDocument(content)

    const sections = this.syncService.getSections()
    const savedLayout = this.layoutHost.getLayout(file.path)

    this.currentTree = savedLayout?.tree
      ? reconcileTreeWithSections(savedLayout.tree, sections.length)
      : createDefaultTree(sections.length)

    this.renderLayout()
  }

  async onOpen(): Promise<void> {
    this.containerEl.addClass('orbit-tiling-view')

    this.registerEvent(
      this.app.vault.on('modify', async (file) => {
        if (!this.currentFile || file.path !== this.currentFile.path) return

        const diskContent = await this.app.vault.read(this.currentFile)
        const inMemory = this.syncService.serialize(
          this.currentTree,
          this.layoutHost.getSyncTextOrder()
        )
        if (diskContent === inMemory) return

        this.syncService.loadDocument(diskContent)
        const sections = this.syncService.getSections()
        this.currentTree = this.currentTree
          ? reconcileTreeWithSections(this.currentTree, sections.length)
          : createDefaultTree(sections.length)

        await this.persistGeometry()
        this.renderLayout()
      })
    )

    if (this.currentFile) {
      await this.setFile(this.currentFile)
    } else {
      this.renderEmptyState()
    }
  }

  async onClose(): Promise<void> {
    if (this.currentFile) {
      await this.flushSave()
      await this.persistGeometry()
    }
    this.fileAdapter.dispose()
    this.cleanupRenderedState()
  }

  addCleanup(cleanup: () => void): void {
    this.cleanups.push(cleanup)
  }

  scheduleSave(): void {
    if (this.currentFile) {
      this.fileAdapter.scheduleSave(this.currentFile, () => this.getSerializedContent())
    }
  }

  async flushSave(): Promise<void> {
    if (this.currentFile) {
      await this.fileAdapter.flushSave(this.currentFile, () => this.getSerializedContent())
    }
  }

  private getSerializedContent(): string {
    return this.syncService.serialize(this.currentTree, this.layoutHost.getSyncTextOrder())
  }

  private cleanupRenderedState(): void {
    for (const cleanup of this.cleanups) cleanup()
    this.cleanups = []
    for (const editor of this.activeEditors.values()) editor.destroy()
    this.activeEditors.clear()
    this.panelElements.clear()
  }

  private renderEmptyState(): void {
    this.cleanupRenderedState()
    this.activeLeafId = null
    const contentEl = this.contentEl
    contentEl.empty()

    const empty = contentEl.createDiv({ cls: 'orbit-tiling-empty' })
    empty.createDiv({ text: 'No active note selected for Tiling Renderer.' })
    empty.createDiv({
      text: 'Open a markdown note and run "Tiling renderer: Open current note".',
      cls: 'text-muted',
    })
  }

  renderLayout(): void {
    this.cleanupRenderedState()
    const contentEl = this.contentEl
    contentEl.empty()

    const sections = this.syncService.getSections()
    if (sections.length === 0 || !this.currentTree) {
      this.renderEmptyState()
      return
    }

    const container = contentEl.createDiv({ cls: 'orbit-tiling-container' })
    container.style.setProperty('--orbit-tiling-gap', `${this.layoutHost.getGap()}px`)

    this.panelRenderer.renderNode(container, this.currentTree, sections)

    const leaves = getAllLeaves(this.currentTree)
    if (!this.activeLeafId || !leaves.some((l) => l.id === this.activeLeafId)) {
      this.activeLeafId = leaves[0]?.id ?? null
    }

    if (this.activeLeafId) {
      this.highlightFocusedPanel(this.activeLeafId)
    }
  }

  async saveAndRerender(): Promise<void> {
    if (this.layoutHost.getSyncTextOrder() && this.currentTree) {
      this.currentTree = this.syncService.syncSectionsToTree(this.currentTree)
    }
    await this.flushSave()
    await this.persistGeometry()
    this.renderLayout()
  }

  private async handleMoveLeafToPosition(
    fromId: string,
    toId: string,
    position: DropZonePosition
  ): Promise<void> {
    if (!this.currentTree || !this.currentFile) return
    this.currentTree = moveLeafToPosition(this.currentTree, fromId, toId, position)
    if (position === 'center') {
      this.activeLeafId = toId
    } else {
      this.activeLeafId = fromId
    }
    await this.saveAndRerender()
    this.setActiveLeaf(this.activeLeafId, true)
  }

  async persistGeometry(): Promise<void> {
    if (!this.currentFile || !this.currentTree) return
    await this.layoutHost.saveLayout(this.currentFile.path, {
      tree: this.currentTree,
    })
  }

  // --- Hyprland Focus & Navigation ---

  getActiveLeafId(): string | null {
    return this.activeLeafId
  }

  setActiveLeaf(leafId: string, focusEditor = false): void {
    if (this.activeLeafId === leafId) {
      if (focusEditor) {
        this.activeEditors.get(leafId)?.focus()
      }
      return
    }
    this.activeLeafId = leafId
    this.highlightFocusedPanel(leafId)
    if (focusEditor) {
      this.activeEditors.get(leafId)?.focus()
    }
  }

  private highlightFocusedPanel(leafId: string): void {
    for (const [id, el] of this.panelElements.entries()) {
      if (id === leafId) {
        el.addClass('is-focused')
      } else {
        el.removeClass('is-focused')
      }
    }
  }

  focusInDirection(direction: Direction): void {
    if (!this.currentTree || !this.activeLeafId) return
    const neighborId = findAdjacentLeaf(this.currentTree, this.activeLeafId, direction)
    if (neighborId) {
      this.setActiveLeaf(neighborId, true)
    }
  }

  async moveInDirection(direction: Direction): Promise<void> {
    if (!this.currentTree || !this.activeLeafId || !this.currentFile) return
    const neighborId = findAdjacentLeaf(this.currentTree, this.activeLeafId, direction)
    if (!neighborId) return

    this.currentTree = swapLeavesById(this.currentTree, this.activeLeafId, neighborId)
    this.activeLeafId = neighborId
    await this.saveAndRerender()
    this.setActiveLeaf(neighborId, true)
  }

  async resizeInDirection(direction: Direction, delta = 0.1): Promise<void> {
    if (!this.currentTree || !this.activeLeafId || !this.currentFile) return

    this.currentTree = resizeLeafInDirection(this.currentTree, this.activeLeafId, direction, delta)
    await this.persistGeometry()
    this.renderLayout()
  }

  async splitActivePanel(direction: SplitDirection): Promise<void> {
    if (this.activeLeafId) {
      await this.panelRenderer.handleSplit(this.activeLeafId, direction)
    }
  }

  async closeActivePanel(): Promise<void> {
    if (this.activeLeafId) {
      await this.panelRenderer.handleCloseLeaf(this.activeLeafId)
    }
  }

  toggleActivePanelMode(): void {
    if (!this.activeLeafId) return
    const activeEl = this.panelElements.get(this.activeLeafId)
    if (!activeEl) return

    const bodyEl = activeEl.querySelector('.orbit-tiling-panel-body') as HTMLElement | null
    const toggleBtn = activeEl.querySelector('.orbit-tiling-mode-btn') as HTMLElement | null
    const leaf = this.currentTree
      ? getAllLeaves(this.currentTree).find((l) => l.id === this.activeLeafId)
      : null

    if (bodyEl && toggleBtn && leaf) {
      const activeMode = this.panelModes.get(leaf.id) ?? 'preview'
      const nextMode = activeMode === 'preview' ? 'edit' : 'preview'
      this.panelRenderer.setLeafMode(bodyEl, leaf, nextMode, toggleBtn)
    }
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
}
