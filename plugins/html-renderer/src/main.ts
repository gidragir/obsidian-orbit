import { VaultAdapter } from '@packages/adapters'
import { ContentLoader } from '@services/content-loader'
import { ThemeService } from '@services/theme-service'
import { DEFAULT_SETTINGS, type HTMLRendererSettings } from '@settings/settings'
import { HTMLRendererSettingTab } from '@settings/settings-tab'
import { HTMLRenderChild } from '@ui/html-render-child'
import { type MarkdownPostProcessorContext, Plugin } from 'obsidian'

export default class HTMLRendererPlugin extends Plugin {
  settings: HTMLRendererSettings = { ...DEFAULT_SETTINGS }

  async onload(): Promise<void> {
    await this.loadSettings()
    const contentLoader = new ContentLoader(new VaultAdapter(this.app.vault))
    const themeService = new ThemeService()

    this.registerMarkdownCodeBlockProcessor(
      'html-renderer',
      (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        ctx.addChild(new HTMLRenderChild(el, source, this.settings, contentLoader, themeService))
      }
    )

    this.addSettingTab(new HTMLRendererSettingTab(this.app, this))
  }

  async loadSettings(): Promise<void> {
    const loadedData = (await this.loadData()) as Partial<HTMLRendererSettings> | null
    this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData ?? {})
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings)
  }
}
