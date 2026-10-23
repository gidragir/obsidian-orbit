import { replaceCodeBlock } from '@packages/adapters'
import {
  computeInsertIndex,
  computeSortZone,
  DndController,
  type ListDropZone,
  remapIndexAfterMove,
} from '@packages/ui'
import type { EditorService } from '@services/editor-service'
import type { TabsCacheService } from '@services/tabs-cache-service'
import type { TabsSettings } from '@settings/settings'
import { parseConfig } from '@utils/config-parser'
import { reorderTabs } from '@utils/reorder'
import { type ParsedTabsResult, parseTabs } from '@utils/tabs-parser'
import { serializeTabs } from '@utils/tabs-serializer'
import {
  type App,
  MarkdownRenderChild,
  MarkdownRenderer,
  type MarkdownSectionInformation,
} from 'obsidian'
import type { TabsEditorModal } from './editor/tab-editor-modal'

const TABS_DND_MIME = 'application/x-orbit-tabs-item'

export class TabsView extends MarkdownRenderChild {
  private readonly app: App
  private readonly sourcePath: string
  private readonly settings: TabsSettings
  private readonly cacheService: TabsCacheService
  private readonly editorService: EditorService
  private readonly editorModal: TabsEditorModal
  private readonly sectionInfo: MarkdownSectionInformation | null

  private parsedResult: ParsedTabsResult
  private activeIndex = 0
  private navEl: HTMLElement | null = null
  private contentElContainer: HTMLElement | null = null
  private readonly dnd = new DndController<number, ListDropZone>({
    mime: TABS_DND_MIME,
    resolveZone: (_e, _itemEl, fromIndex, targetIndex) => computeSortZone(fromIndex, targetIndex),
    showIndicator: (itemEl, zone) => {
      itemEl.classList.add('tabs-nav-item-dragover')
      itemEl.classList.toggle('tabs-nav-item-dragover-after', zone === 'after')
      itemEl.classList.toggle('tabs-nav-item-dragover-before', zone === 'before')
    },
    clearIndicator: (itemEl) => {
      itemEl.classList.remove(
        'tabs-nav-item-dragover',
        'tabs-nav-item-dragover-before',
        'tabs-nav-item-dragover-after'
      )
    },
    onDrop: (fromIndex, targetIndex, zone) => {
      const toIndex = computeInsertIndex(fromIndex, targetIndex, zone)
      if (toIndex !== fromIndex) {
        this.handleReorder(fromIndex, toIndex)
      }
    },
  })

  constructor(
    containerEl: HTMLElement,
    app: App,
    source: string,
    sourcePath: string,
    settings: TabsSettings,
    cacheService: TabsCacheService,
    editorService: EditorService,
    editorModal: TabsEditorModal,
    sectionInfo: MarkdownSectionInformation | null
  ) {
    super(containerEl)
    this.app = app
    this.sourcePath = sourcePath
    this.settings = settings
    this.cacheService = cacheService
    this.editorService = editorService
    this.editorModal = editorModal
    this.sectionInfo = sectionInfo

    this.parsedResult = parseTabs(
      source,
      settings.split,
      settings.defaultTabNavItem,
      settings.defaultTabContent
    )
  }

  onload(): void {
    const cacheKey = this.getCacheKey()
    this.activeIndex = this.cacheService.getActiveIndex(cacheKey)
    this.renderWidget()
  }

  private renderWidget(): void {
    this.containerEl.empty()
    this.containerEl.className = 'tabs-container'

    const config = parseConfig(this.parsedResult.rawConfig, {
      titlePosition: this.settings.defaultTitlePosition,
      titleLineClamp: this.settings.defaultTitleLineClamp,
      actionButton: this.settings.actionButtonType,
    })

    this.containerEl.classList.add(`tabs-nav-${config.titlePosition}`)
    this.containerEl.classList.add(`tabs-nav-${config.titleLineClamp}`)
    this.containerEl.classList.add(`tabs-${this.settings.defaultTabsBorder}`)

    this.renderNav()
    this.renderContentArea()
  }

  private renderNav(): void {
    if (this.navEl) {
      this.navEl.empty()
    } else {
      this.navEl = this.containerEl.createDiv({ cls: 'tabs-nav' })
    }
    this.parsedResult.tabs.forEach((tab, index) => {
      const itemEl = this.navEl?.createDiv({
        cls: `tabs-nav-item${index === this.activeIndex ? ' is-active' : ''}`,
      })
      if (!itemEl) return

      itemEl.textContent = tab.title
      if (this.settings.dragAndDrop) {
        this.attachDndEvents(itemEl, index)
      }

      this.registerDomEvent(itemEl, 'click', () => this.switchTab(index))
    })
  }

  private attachDndEvents(itemEl: HTMLElement, index: number): void {
    itemEl.draggable = true
    this.registerDomEvent(itemEl, 'dragstart', (e) => this.dnd.onDragStart(e, index, itemEl))
    this.registerDomEvent(itemEl, 'dragover', (e) => this.dnd.onDragOver(e, index, itemEl))
    this.registerDomEvent(itemEl, 'dragleave', (e) => this.dnd.onDragLeave(e, itemEl))
    this.registerDomEvent(itemEl, 'drop', (e) => this.dnd.onDrop(e, index))
    this.registerDomEvent(itemEl, 'dragend', () => this.dnd.onDragEnd())
  }

  private renderContentArea(): void {
    this.contentElContainer = this.containerEl.createDiv({
      cls: 'tabs-contents',
    })
    this.contentElContainer.style.setProperty(
      '--tabs-contents-padding',
      this.settings.defaultTabsContentsPadding
    )

    if (this.settings.doubleClickToEdit) {
      this.registerDomEvent(this.contentElContainer, 'dblclick', (e) => {
        e.preventDefault()
        this.openEditorModal()
      })
    }

    this.renderActiveContent()
  }

  private renderActiveContent(): void {
    if (!this.contentElContainer) return
    this.contentElContainer.empty()

    const activeTab = this.parsedResult.tabs[this.activeIndex]
    if (!activeTab) return

    const itemContentEl = this.contentElContainer.createDiv({
      cls: 'tab-content is-active',
    })
    void MarkdownRenderer.render(this.app, activeTab.content, itemContentEl, this.sourcePath, this)
  }

  private switchTab(index: number): void {
    this.activeIndex = index
    this.cacheService.setActiveIndex(this.getCacheKey(), index)

    const items = this.navEl?.querySelectorAll('.tabs-nav-item')
    items?.forEach((el, i) => {
      el.classList.toggle('is-active', i === index)
    })

    this.renderActiveContent()
  }

  private handleReorder(fromIndex: number, toIndex: number): void {
    const reordered = reorderTabs(this.parsedResult.tabs, fromIndex, toIndex)
    this.parsedResult = {
      rawConfig: this.parsedResult.rawConfig,
      tabs: reordered,
    }

    // the active tab stays the same tab, only its index follows the move
    this.activeIndex = remapIndexAfterMove(this.activeIndex, fromIndex, toIndex)
    this.cacheService.setActiveIndex(this.getCacheKey(), this.activeIndex)
    this.renderNav()

    const newDoc = serializeTabs(reordered, this.settings.split, this.parsedResult.rawConfig)
    this.updateDocument(newDoc)
  }

  private openEditorModal(): void {
    const activeTab = this.parsedResult.tabs[this.activeIndex]
    if (!activeTab) return

    this.editorModal.startEditing(
      activeTab.title,
      activeTab.content,
      this.sourcePath,
      (updatedTitle, updatedContent) => {
        const titleChanged = updatedTitle !== activeTab.title
        const updatedTabs = this.parsedResult.tabs.map((tab, i) =>
          i === this.activeIndex ? { ...tab, title: updatedTitle, content: updatedContent } : tab
        )
        this.parsedResult = {
          rawConfig: this.parsedResult.rawConfig,
          tabs: updatedTabs,
        }
        const newDoc = serializeTabs(updatedTabs, this.settings.split, this.parsedResult.rawConfig)
        this.updateDocument(newDoc)

        if (titleChanged) {
          this.renderNav()
        }
        this.renderActiveContent()
      }
    )
  }

  private updateDocument(newDoc: string): void {
    if (!this.sectionInfo) return
    const activeEditor = this.editorService.getActiveEditor()
    if (!activeEditor) return

    replaceCodeBlock(activeEditor, this.sectionInfo, newDoc, '```tabs-renderer')
  }

  private getCacheKey(): string {
    if (this.sectionInfo) {
      return `${this.sourcePath}:${this.sectionInfo.lineStart}`
    }
    return '/'
  }
}
