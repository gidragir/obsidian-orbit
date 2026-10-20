import type { App } from 'obsidian'

function parsePluginList(rawContent: string): readonly string[] | null {
  try {
    const parsed: unknown = JSON.parse(rawContent)
    if (!Array.isArray(parsed)) {
      return null
    }
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return null
  }
}

function getFsModule(): {
  writeFileSync?: (filePath: string, data: string) => void
  readFileSync?: (filePath: string, encoding: string) => string
} | null {
  try {
    const win = (typeof window !== 'undefined' ? window : globalThis) as unknown as {
      require?: (mod: string) => {
        writeFileSync?: (filePath: string, data: string) => void
        readFileSync?: (filePath: string, encoding: string) => string
      }
    }
    if (typeof win.require === 'function') {
      return win.require('node:fs') ?? win.require('fs')
    }
    const glob = globalThis as unknown as {
      require?: (mod: string) => {
        writeFileSync?: (filePath: string, data: string) => void
        readFileSync?: (filePath: string, encoding: string) => string
      }
    }
    if (typeof glob.require === 'function') {
      return glob.require('node:fs') ?? glob.require('fs')
    }
  } catch {
    return null
  }
  return null
}

export class CommunityPluginsAdapter {
  private readonly app: App

  constructor(app: App) {
    this.app = app
  }

  getCommunityPluginsPath(): string {
    return `${this.app.vault.configDir}/community-plugins.json`
  }

  getBackupPluginsPath(): string {
    return `${this.app.vault.configDir}/community-plugins.vault-renderer.bak`
  }

  async readCommunityPlugins(): Promise<readonly string[] | null> {
    const path = this.getCommunityPluginsPath()
    try {
      const exists = await this.app.vault.adapter.exists(path)
      if (!exists) {
        return null
      }
      const raw = await this.app.vault.adapter.read(path)
      return parsePluginList(raw)
    } catch (error) {
      console.warn(`[vault-renderer] Failed to read ${path}:`, error)
      return null
    }
  }

  async writeCommunityPlugins(pluginIds: readonly string[]): Promise<boolean> {
    const path = this.getCommunityPluginsPath()
    try {
      const content = JSON.stringify(pluginIds, null, 2)
      await this.app.vault.adapter.write(path, content)
      return true
    } catch (error) {
      console.error(`[vault-renderer] Failed to write ${path}:`, error)
      return false
    }
  }

  async readBackupPlugins(): Promise<readonly string[] | null> {
    const path = this.getBackupPluginsPath()
    try {
      const exists = await this.app.vault.adapter.exists(path)
      if (!exists) {
        return null
      }
      const raw = await this.app.vault.adapter.read(path)
      return parsePluginList(raw)
    } catch (error) {
      console.warn(`[vault-renderer] Failed to read backup at ${path}:`, error)
      return null
    }
  }

  readBackupPluginsSync(): readonly string[] | null {
    const path = this.getBackupPluginsPath()
    try {
      const fs = getFsModule()
      const adapter = this.app.vault.adapter as unknown as { basePath?: string }
      if (typeof fs?.readFileSync === 'function' && typeof adapter.basePath === 'string') {
        const fullPath = `${adapter.basePath}/${path}`
        const raw = fs.readFileSync(fullPath, 'utf8')
        return parsePluginList(raw)
      }
    } catch {
      return null
    }
    return null
  }

  async writeBackupPlugins(pluginIds: readonly string[]): Promise<boolean> {
    const path = this.getBackupPluginsPath()
    try {
      const content = JSON.stringify(pluginIds, null, 2)
      await this.app.vault.adapter.write(path, content)
      return true
    } catch (error) {
      console.error(`[vault-renderer] Failed to write backup at ${path}:`, error)
      return false
    }
  }

  async backupExists(): Promise<boolean> {
    const path = this.getBackupPluginsPath()
    try {
      return await this.app.vault.adapter.exists(path)
    } catch {
      return false
    }
  }

  async restoreFromBackup(): Promise<boolean> {
    const backup = await this.readBackupPlugins()
    if (!backup || backup.length === 0) {
      return false
    }
    return this.writeCommunityPlugins(backup)
  }

  writeCommunityPluginsSync(pluginIds: readonly string[]): boolean {
    const path = this.getCommunityPluginsPath()
    const content = JSON.stringify(pluginIds, null, 2)

    // Attempt direct synchronous filesystem write in Electron/Node environment if available
    try {
      const fs = getFsModule()
      const adapter = this.app.vault.adapter as unknown as { basePath?: string }
      if (typeof fs?.writeFileSync === 'function' && typeof adapter.basePath === 'string') {
        const fullPath = `${adapter.basePath}/${path}`
        fs.writeFileSync(fullPath, content)
        return true
      }
    } catch (err) {
      console.warn('[vault-renderer] Synchronous fs write unavailable, falling back:', err)
    }

    // Fallback: asynchronous write scheduled without awaiting
    void this.writeCommunityPlugins(pluginIds)
    return true
  }
}
