import type { TabsSettings } from '@settings/settings'
import {
  type App,
  type Plugin,
  PluginSettingTab,
  Setting,
  type SettingDefinitionItem,
} from 'obsidian'

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

  override getControlValue(key: string): unknown {
    const settings = this.plugin.settings as unknown as Record<string, unknown>
    return settings[key]
  }

  override async setControlValue(key: string, value: unknown): Promise<void> {
    const settings = this.plugin.settings as unknown as Record<string, unknown>
    settings[key] = value
    await this.plugin.saveSettings()
  }

  override getSettingDefinitions(): SettingDefinitionItem<keyof TabsSettings>[] {
    return [
      {
        name: 'Tab separator',
        desc: 'Prefix used to distinguish tab titles in markdown.',
        aliases: ['separator', 'split', 'prefix', 'разделитель', 'префикс'],
        control: {
          type: 'text',
          key: 'split',
          placeholder: 'tab: ',
          defaultValue: 'tab: ',
        },
      },
      {
        name: 'Default tab name',
        desc: 'Default title for newly created tabs.',
        aliases: ['tab name', 'title', 'new tab', 'имя вкладки', 'заголовок'],
        control: {
          type: 'text',
          key: 'defaultTabNavItem',
          placeholder: 'New tab',
          defaultValue: 'New tab',
        },
      },
      {
        name: 'Default tab content',
        desc: 'Default markdown content for newly created tabs.',
        aliases: ['content', 'body', 'tab content', 'содержимое', 'текст вкладки'],
        control: {
          type: 'text',
          key: 'defaultTabContent',
          placeholder: 'New tab content',
          defaultValue: 'New tab content',
        },
      },
      {
        name: 'Enable drag and drop',
        desc: 'Allow reordering tabs by dragging tab headers.',
        aliases: ['drag', 'drop', 'dnd', 'reorder', 'перетаскивание'],
        control: {
          type: 'toggle',
          key: 'dragAndDrop',
          defaultValue: false,
        },
      },
      {
        type: 'group',
        heading: 'Editor',
        items: [
          {
            name: 'Double click to edit',
            desc: 'Open tab editor modal on double clicking tab content.',
            aliases: ['double click', 'edit modal', 'editor', 'двойной клик', 'редактор'],
            control: {
              type: 'toggle',
              key: 'doubleClickToEdit',
              defaultValue: false,
            },
          },
          {
            name: 'Show editor toolbar',
            desc: 'Display formatting toolbar in tab editor modal.',
            aliases: ['toolbar', 'formatting', 'editor toolbar', 'панель инструментов'],
            control: {
              type: 'toggle',
              key: 'showToolbar',
              defaultValue: true,
            },
          },
          {
            name: 'Editor tab size',
            desc: 'Number of spaces for tab indentation in editor.',
            aliases: ['tab size', 'indent', 'indentation', 'отступ', 'табуляция'],
            control: {
              type: 'number',
              key: 'tabSize',
              min: 1,
              max: 8,
              placeholder: '4',
              defaultValue: 4,
            },
          },
          {
            name: 'Auto-save interval (ms)',
            desc: 'Interval in milliseconds to auto-save tab edits (0 to disable).',
            aliases: ['auto-save', 'save interval', 'debounce', 'автосохранение'],
            control: {
              type: 'number',
              key: 'editorAutoSaveInterval',
              min: 0,
              placeholder: '5000',
              defaultValue: 5000,
              validate: (value: number) => (value < 0 ? 'Interval cannot be negative' : undefined),
            },
          },
        ],
      },
      {
        type: 'group',
        heading: 'Appearance',
        items: [
          {
            name: 'Default tab border',
            desc: 'Border style around tabs container.',
            aliases: ['border', 'style', 'outline', 'граница', 'рамка'],
            control: {
              type: 'dropdown',
              key: 'defaultTabsBorder',
              defaultValue: 'border-hover',
              options: {
                'border-none': 'None',
                'border-hover': 'Hover',
                'border-always': 'Always',
              },
            },
          },
          {
            name: 'Tab title position',
            desc: 'Position of the tab navigation headers.',
            aliases: ['position', 'headers', 'tabs placement', 'layout', 'расположение', 'позиция'],
            control: {
              type: 'dropdown',
              key: 'defaultTitlePosition',
              defaultValue: 'top',
              options: {
                top: 'Top',
                bottom: 'Bottom',
                left: 'Left',
                right: 'Right',
              },
            },
          },
        ],
      },
    ]
  }

  override display(): void {
    const { containerEl } = this
    containerEl.empty()

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
      .setName('Default tab content')
      .setDesc('Default markdown content for newly created tabs.')
      .addText((text) =>
        text.setValue(this.plugin.settings.defaultTabContent).onChange(async (val) => {
          this.plugin.settings.defaultTabContent = val || 'New tab content'
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

    new Setting(containerEl).setName('Editor').setHeading()

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
      .setName('Editor tab size')
      .setDesc('Number of spaces for tab indentation in editor.')
      .addText((text) =>
        text.setValue(String(this.plugin.settings.tabSize)).onChange(async (val) => {
          const parsed = Number.parseInt(val, 10)
          if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 8) {
            this.plugin.settings.tabSize = parsed
            await this.plugin.saveSettings()
          }
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

    new Setting(containerEl).setName('Appearance').setHeading()

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
