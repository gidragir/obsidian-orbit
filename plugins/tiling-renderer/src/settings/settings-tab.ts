import { type App, PluginSettingTab, Setting } from 'obsidian'
import type TilingRendererPlugin from '../main'

export class TilingSettingTab extends PluginSettingTab {
  private readonly plugin: TilingRendererPlugin

  constructor(app: App, plugin: TilingRendererPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this
    containerEl.empty()

    containerEl.createEl('h2', { text: 'Tiling Renderer Settings' })

    const settings = this.plugin.getSettings()

    new Setting(containerEl)
      .setName('Panel gap')
      .setDesc('Spacing between tiled panels and splitters in pixels (0 - 32px).')
      .addSlider((slider) =>
        slider
          .setLimits(0, 32, 2)
          .setValue(settings.panelGap)
          .setDynamicTooltip()
          .onChange(async (value) => {
            await this.plugin.updateSettings({ panelGap: value })
          })
      )

    new Setting(containerEl)
      .setName('Auto-save debounce')
      .setDesc('Delay in milliseconds before saving note edits to disk.')
      .addText((text) =>
        text
          .setPlaceholder('500')
          .setValue(String(settings.debounceMs))
          .onChange(async (value) => {
            const parsed = Number.parseInt(value, 10)
            if (!Number.isNaN(parsed) && parsed >= 100) {
              await this.plugin.updateSettings({ debounceMs: parsed })
            }
          })
      )
  }
}
