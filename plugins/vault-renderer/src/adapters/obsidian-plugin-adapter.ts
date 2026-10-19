import type { InstalledPluginInfo } from '@core/types'
import type { App } from 'obsidian'

interface ObsidianPluginManifest {
  readonly id: string
  readonly name: string
  readonly version: string
  readonly description?: string
}

interface ObsidianPluginsManager {
  readonly manifests: Record<string, ObsidianPluginManifest>
  readonly enabledPlugins: Set<string>
  readonly plugins: Record<string, unknown>
  enablePluginAndSave(id: string): Promise<boolean>
  disablePluginAndSave(id: string): Promise<boolean>
  enablePlugin(id: string): Promise<void>
  disablePlugin(id: string): Promise<void>
}

export class ObsidianPluginAdapter {
  private readonly app: App

  constructor(app: App) {
    this.app = app
  }

  private getManager(): ObsidianPluginsManager | null {
    const candidate = (this.app as unknown as Record<string, unknown>).plugins
    if (typeof candidate === 'object' && candidate !== null && 'manifests' in candidate) {
      return candidate as unknown as ObsidianPluginsManager
    }
    return null
  }

  getInstalledPlugins(): Record<string, InstalledPluginInfo> {
    const manager = this.getManager()
    if (!manager) {
      return {}
    }

    const result: Record<string, InstalledPluginInfo> = {}
    for (const [id, manifest] of Object.entries(manager.manifests)) {
      result[id] = {
        id,
        name: manifest.name ?? id,
        version: manifest.version ?? '0.0.0',
        description: manifest.description ?? '',
      }
    }

    return result
  }

  getEnabledPluginIds(): Set<string> {
    const manager = this.getManager()
    if (!manager) {
      return new Set()
    }
    return new Set(manager.enabledPlugins)
  }

  isPluginEnabled(id: string): boolean {
    const manager = this.getManager()
    return manager ? manager.enabledPlugins.has(id) : false
  }

  isPluginCurrentlyEnabled(id: string): boolean {
    return this.isPluginEnabled(id)
  }

  async togglePlugin(id: string, enabled: boolean): Promise<boolean> {
    return enabled ? this.enablePlugin(id) : this.disablePlugin(id)
  }

  async enablePlugin(id: string): Promise<boolean> {
    const manager = this.getManager()
    if (!manager) {
      return false
    }

    try {
      if (typeof manager.enablePluginAndSave === 'function') {
        await manager.enablePluginAndSave(id)
      } else if (typeof manager.enablePlugin === 'function') {
        await manager.enablePlugin(id)
      }
      return true
    } catch (error) {
      console.error(`[vault-renderer] Failed to enable plugin '${id}':`, error)
      return false
    }
  }

  async disablePlugin(id: string): Promise<boolean> {
    const manager = this.getManager()
    if (!manager) {
      return false
    }

    try {
      if (typeof manager.disablePluginAndSave === 'function') {
        await manager.disablePluginAndSave(id)
      } else if (typeof manager.disablePlugin === 'function') {
        await manager.disablePlugin(id)
      }
      return true
    } catch (error) {
      console.error(`[vault-renderer] Failed to disable plugin '${id}':`, error)
      return false
    }
  }
}
