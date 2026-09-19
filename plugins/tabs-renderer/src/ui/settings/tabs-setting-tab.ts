import type { TabsSettings } from '@settings/settings'
import { type App, type Plugin, PluginSettingTab, Setting } from 'obsidian'

export interface ITabsPluginHost extends Plugin {
  settings: TabsSettings
  saveSettings(): Promise<void>
}

export class TabsSettingsTab extends PluginSettingTab {
  private readonly plugin: ITabsPluginHost

  constructor(app: App, plugin: ITabsPluginHost) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this
    containerEl.empty()

    this.renderGeneralSettings(containerEl)
    this.renderEditorSettings(containerEl)
    this.renderAppearanceSettings(containerEl)
  }

  private renderGeneralSettings(containerEl: HTMLElement): void {
    new Setting(containerEl)
      .setName('Tab separator')
      .setDesc('Prefix used to distinguish tab titles in markdown.')
      .addText((text) =>
        text
          .setValue(this.plugin.settings.split)
          .setPlaceholder('tab: ')
          .onChange(async (val) => {
            this.plugin.settings.split = val || 'tab: '
            await this.plugin.saveSettings()
          })
      )

    new Setting(containerEl)
      .setName('Default tab name')
      .setDesc('Default title for newly created tabs.')
      .addText((text) =>
        text.setValue(this.plugin.settings.defaultTabNavItem).onChange(async (val) => {
          this.plugin.settings.defaultTabNavItem = val || 'New tab'
          await this.plugin.saveSettings()
        })
      )

    new Setting(containerEl)
      .setName('Enable Drag & Drop')
      .setDesc('Allow reordering tabs by dragging tab headers.')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.dragAndDrop).onChange(async (val) => {
          this.plugin.settings.dragAndDrop = val
          await this.plugin.saveSettings()
        })
      )
  }

  private renderEditorSettings(containerEl: HTMLElement): void {
    new Setting(containerEl).setName('Editor Settings').setHeading()

    new Setting(containerEl)
      .setName('Double click to edit')
      .setDesc('Open tab editor modal on double clicking tab content.')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.doubleClickToEdit).onChange(async (val) => {
          this.plugin.settings.doubleClickToEdit = val
          await this.plugin.saveSettings()
        })
      )

    new Setting(containerEl)
      .setName('Show editor toolbar')
      .setDesc('Display formatting toolbar in tab editor modal.')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.showToolbar).onChange(async (val) => {
          this.plugin.settings.showToolbar = val
          await this.plugin.saveSettings()
        })
      )

    new Setting(containerEl)
      .setName('Auto-save interval (ms)')
      .setDesc('Interval in milliseconds to auto-save tab edits (0 to disable).')
      .addText((text) =>
        text.setValue(String(this.plugin.settings.editorAutoSaveInterval)).onChange(async (val) => {
          const parsed = Number.parseInt(val, 10)
          if (!Number.isNaN(parsed) && parsed >= 0) {
            this.plugin.settings.editorAutoSaveInterval = parsed
            await this.plugin.saveSettings()
          }
        })
      )
  }

  private renderAppearanceSettings(containerEl: HTMLElement): void {
    new Setting(containerEl).setName('Appearance Settings').setHeading()

    new Setting(containerEl)
      .setName('Default tab border')
      .setDesc('Border style around tabs container.')
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            'border-none': 'None',
            'border-hover': 'Hover',
            'border-always': 'Always',
          })
          .setValue(this.plugin.settings.defaultTabsBorder)
          .onChange(async (val) => {
            this.plugin.settings.defaultTabsBorder = val as
              | 'border-none'
              | 'border-hover'
              | 'border-always'
            await this.plugin.saveSettings()
          })
      )

    new Setting(containerEl)
      .setName('Tab title position')
      .setDesc('Position of the tab navigation headers.')
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            top: 'Top',
            bottom: 'Bottom',
            left: 'Left',
            right: 'Right',
          })
          .setValue(this.plugin.settings.defaultTitlePosition)
          .onChange(async (val) => {
            this.plugin.settings.defaultTitlePosition = val as 'top' | 'bottom' | 'left' | 'right'
            await this.plugin.saveSettings()
          })
      )
  }
}
