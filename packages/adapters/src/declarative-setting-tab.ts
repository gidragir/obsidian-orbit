import { type App, type Plugin, PluginSettingTab, type SettingDefinitionItem } from 'obsidian'

export interface DeclarativeSettingHost<TSettings extends object> {
  getSettings(): TSettings
  updateSettings(delta: Partial<TSettings>): Promise<void>
}

/**
 * Base class for plugin settings tabs with native Obsidian 1.13+ declarative control support.
 */
export abstract class DeclarativePluginSettingTab<
  TSettings extends object,
> extends PluginSettingTab {
  protected readonly settingHost: DeclarativeSettingHost<TSettings>

  constructor(app: App, plugin: Plugin, settingHost?: DeclarativeSettingHost<TSettings>) {
    super(app, plugin)
    this.settingHost = settingHost ?? (plugin as unknown as DeclarativeSettingHost<TSettings>)
  }

  override getControlValue(key: string): unknown {
    const settings = this.settingHost.getSettings() as Record<string, unknown>
    return settings[key]
  }

  override async setControlValue(key: string, value: unknown): Promise<void> {
    await this.settingHost.updateSettings({ [key]: value } as unknown as Partial<TSettings>)
  }

  abstract override getSettingDefinitions(): SettingDefinitionItem<string>[]
  abstract override display(): void
}
