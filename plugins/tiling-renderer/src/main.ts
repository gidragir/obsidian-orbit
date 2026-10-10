import { TilingSyncService } from '@services/tiling-sync-service'
import { DEFAULT_SETTINGS, type FileLayoutState, type TilingSettings } from '@settings/settings'
import { TilingSettingTab } from '@settings/settings-tab'
import { TILING_VIEW_TYPE, type TilingLayoutHost, TilingView } from '@ui/tiling-view'
import { MarkdownView, Plugin, type TFile } from 'obsidian'

export default class TilingRendererPlugin extends Plugin implements TilingLayoutHost {
  settings: TilingSettings = DEFAULT_SETTINGS
  private syncService: TilingSyncService = new TilingSyncService()

  async onload(): Promise<void> {
    await this.loadPluginSettings()
    this.syncService = new TilingSyncService(this.settings.debounceMs, this.settings.syncTextOrder)

    this.registerViews()
    this.registerCommands()
    this.registerRibbon()
    this.registerVaultEvents()
    this.registerSettings()
  }

  onunload(): void {
    this.syncService.dispose()
  }

  getSettings(): TilingSettings {
    return this.settings
  }

  getGap(): number {
    return this.settings.panelGap
  }

  getSyncTextOrder(): boolean {
    return this.settings.syncTextOrder
  }

  async updateSettings(partial: Partial<TilingSettings>): Promise<void> {
    this.settings = {
      ...this.settings,
      ...partial,
    }
    if (partial.syncTextOrder !== undefined) {
      this.syncService.setSyncTextOrder(partial.syncTextOrder)
    }
    await this.saveData(this.settings)
  }

  getLayout(filePath: string): FileLayoutState | null {
    return this.settings.fileLayouts[filePath] ?? null
  }

  async saveLayout(filePath: string, state: FileLayoutState): Promise<void> {
    const updatedLayouts = {
      ...this.settings.fileLayouts,
      [filePath]: state,
    }
    this.settings = {
      ...this.settings,
      fileLayouts: updatedLayouts,
    }
    await this.saveData(this.settings)
  }

  private async loadPluginSettings(): Promise<void> {
    const loadedData = (await this.loadData()) as Partial<TilingSettings> | null
    this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData ?? {})
  }

  private registerViews(): void {
    this.registerView(TILING_VIEW_TYPE, (leaf) => new TilingView(leaf, this.syncService, this))
  }

  private registerCommands(): void {
    this.addCommand({
      id: 'open-current-note-tiling',
      name: 'Tiling renderer: Open current note in tiling view',
      checkCallback: (checking: boolean) => {
        const file = this.getActiveMarkdownFile()
        if (!file) return false
        if (!checking) {
          this.openFileInTilingView(file)
        }
        return true
      },
    })

    this.addCommand({
      id: 'toggle-panels-mode-tiling',
      name: 'Tiling renderer: Toggle preview and edit mode for all panels',
      checkCallback: (checking: boolean) => {
        const activeView = this.app.workspace.getActiveViewOfType(TilingView)
        if (!activeView) return false
        if (!checking) {
          activeView.toggleAllPanelsMode()
        }
        return true
      },
    })
  }

  private registerRibbon(): void {
    this.addRibbonIcon('columns-3', 'Open note in Tiling view', () => {
      const file = this.getActiveMarkdownFile()
      if (file) {
        this.openFileInTilingView(file)
      }
    })
  }

  private registerSettings(): void {
    this.addSettingTab(new TilingSettingTab(this.app, this))
  }

  private registerVaultEvents(): void {
    this.registerEvent(
      this.app.vault.on('rename', async (file, oldPath) => {
        const existing = this.settings.fileLayouts[oldPath]
        if (existing) {
          const layouts = { ...this.settings.fileLayouts }
          delete layouts[oldPath]
          layouts[file.path] = existing
          this.settings = {
            ...this.settings,
            fileLayouts: layouts,
          }
          await this.saveData(this.settings)
        }
      })
    )

    this.registerEvent(
      this.app.vault.on('delete', async (file) => {
        if (this.settings.fileLayouts[file.path]) {
          const layouts = { ...this.settings.fileLayouts }
          delete layouts[file.path]
          this.settings = {
            ...this.settings,
            fileLayouts: layouts,
          }
          await this.saveData(this.settings)
        }
      })
    )
  }

  private getActiveMarkdownFile(): TFile | null {
    const file = this.app.workspace.getActiveFile()
    if (file && file.extension === 'md') {
      return file
    }
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
    return activeView?.file ?? null
  }

  private async openFileInTilingView(file: TFile): Promise<void> {
    const leaf = this.app.workspace.getLeaf('tab')
    await leaf.setViewState({
      type: TILING_VIEW_TYPE,
      active: true,
      state: { file: file.path },
    })
    const view = leaf.view
    if (view instanceof TilingView) {
      await view.setFile(file)
    }
  }
}
