import { ClipboardAdapter } from '@packages/adapters'
import { ClipboardService } from '@services/clipboard-service'
import { EditorService } from '@services/editor-service'
import { TabsCacheService } from '@services/tabs-cache-service'
import { DEFAULT_SETTINGS, type TabsSettings } from '@settings/settings'
import { TabsEditorModal } from '@ui/editor/tab-editor-modal'
import { TabsSettingsTab } from '@ui/settings/tabs-setting-tab'
import { TabsView } from '@ui/tabs-view'
import { type MarkdownPostProcessorContext, Plugin } from 'obsidian'

export default class TabsRendererPlugin extends Plugin {
  settings: TabsSettings = { ...DEFAULT_SETTINGS }
  readonly cacheService = new TabsCacheService()
  editorService: EditorService | null = null
  clipboardService: ClipboardService | null = null
  editorModal: TabsEditorModal | null = null

  async onload(): Promise<void> {
    await this.loadSettings()
    this.editorService = new EditorService(this.app)
    this.clipboardService = new ClipboardService(new ClipboardAdapter())
    this.editorModal = new TabsEditorModal(this.app, this, this.settings)

    this.registerViews()
    this.registerEvents()
    this.addSettingTab(new TabsSettingsTab(this.app, this))
  }

  private registerViews(): void {
    this.registerMarkdownCodeBlockProcessor(
      'tabs-renderer',
      (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        if (!this.editorService || !this.editorModal) {
          return
        }
        const sectionInfo = ctx.getSectionInfo(el)
        ctx.addChild(
          new TabsView(
            el,
            this.app,
            source,
            ctx.sourcePath,
            this.settings,
            this.cacheService,
            this.editorService,
            this.editorModal,
            sectionInfo
          )
        )
      }
    )
  }

  private registerEvents(): void {
    this.registerEvent(
      this.app.workspace.on('active-leaf-change', () => {
        this.cacheService.reset()
      })
    )
  }

  async loadSettings(): Promise<void> {
    const loadedData = (await this.loadData()) as Partial<TabsSettings> | null
    this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData ?? {})
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings)
  }
}
