import type { ISettingsPort } from '@packages/ports'
import type { Plugin } from 'obsidian'

export interface SettingsStorage {
  loadData(): Promise<unknown>
  saveData(data: unknown): Promise<void>
}

export class ObsidianSettingsAdapter<T> implements ISettingsPort<T> {
  private readonly storage: SettingsStorage
  private readonly defaultSettings: T
  private readonly mergeFn: ((defaults: T, loaded: unknown) => T) | undefined

  constructor(
    pluginOrStorage: Plugin | SettingsStorage,
    defaultSettings: T,
    mergeFn?: ((defaults: T, loaded: unknown) => T) | undefined
  ) {
    this.storage = pluginOrStorage
    this.defaultSettings = defaultSettings
    this.mergeFn = mergeFn
  }

  async loadSettings(): Promise<T> {
    const loaded = await this.storage.loadData()
    if (this.mergeFn) {
      return this.mergeFn(this.defaultSettings, loaded)
    }
    if (loaded && typeof loaded === 'object') {
      return { ...this.defaultSettings, ...loaded }
    }
    return { ...this.defaultSettings }
  }

  async saveSettings(settings: T): Promise<void> {
    await this.storage.saveData(settings)
  }
}
