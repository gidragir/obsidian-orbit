import { DeclarativePluginSettingTab, type DeclarativeSettingHost } from '@packages/adapters'
import type { TilingSettings } from '@settings/settings'
import { type App, type Plugin, Setting, type SettingDefinitionItem } from 'obsidian'

export class TilingSettingTab extends DeclarativePluginSettingTab<TilingSettings> {
  constructor(app: App, plugin: Plugin, settingHost?: DeclarativeSettingHost<TilingSettings>) {
    super(app, plugin, settingHost)
  }

  override getSettingDefinitions(): SettingDefinitionItem<string>[] {
    return [
      {
        name: 'Panel gap',
        desc: 'Spacing between tiled panels and splitters in pixels (0 - 32px).',
        aliases: ['gap', 'spacing', 'padding', 'splitter', 'margins'],
        control: {
          type: 'slider',
          key: 'panelGap',
          min: 0,
          max: 32,
          step: 2,
          defaultValue: 10,
          displayFormat: (value: number) => `${value}px`,
        },
      },
      {
        name: 'Auto-save debounce (ms)',
        desc: 'Delay in milliseconds before saving note edits to disk (minimum 100ms).',
        aliases: ['debounce', 'delay', 'save', 'timeout'],
        control: {
          type: 'number',
          key: 'debounceMs',
          min: 100,
          placeholder: '500',
          defaultValue: 500,
          validate: (value: number) =>
            value < 100 ? 'Debounce must be at least 100ms' : undefined,
        },
      },
      {
        name: 'Sync note text order',
        desc: 'When enabled, moving panels in tiling view will reorder sections in the note text. When disabled, note text order remains unchanged.',
        aliases: ['sync', 'order', 'reorder', 'document order', 'sections'],
        control: {
          type: 'toggle',
          key: 'syncTextOrder',
          defaultValue: true,
        },
      },
    ]
  }

  override display(): void {
    const { containerEl } = this
    containerEl.empty()

    const settings = this.settingHost.getSettings()

    new Setting(containerEl)
      .setName('Panel gap')
      .setDesc('Spacing between tiled panels and splitters in pixels (0 - 32px).')
      .addSlider((slider) =>
        slider
          .setLimits(0, 32, 2)
          .setValue(settings.panelGap)
          .setDynamicTooltip()
          .onChange(async (value) => {
            await this.settingHost.updateSettings({ panelGap: value })
          })
      )

    new Setting(containerEl)
      .setName('Auto-save debounce (ms)')
      .setDesc('Delay in milliseconds before saving note edits to disk.')
      .addText((text) =>
        text
          .setPlaceholder('500')
          .setValue(String(settings.debounceMs))
          .onChange(async (value) => {
            const parsed = Number.parseInt(value, 10)
            if (!Number.isNaN(parsed) && parsed >= 100) {
              await this.settingHost.updateSettings({ debounceMs: parsed })
            }
          })
      )

    new Setting(containerEl)
      .setName('Sync note text order')
      .setDesc(
        'When enabled, moving panels in tiling view will reorder sections in the note text. When disabled, note text order remains unchanged.'
      )
      .addToggle((toggle) =>
        toggle.setValue(settings.syncTextOrder).onChange(async (value) => {
          await this.settingHost.updateSettings({ syncTextOrder: value })
        })
      )
  }
}
