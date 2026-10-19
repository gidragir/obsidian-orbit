import type { App } from 'obsidian'

export class ObsidianStorageAdapter {
  private readonly app: App

  constructor(app: App) {
    this.app = app
  }

  async exists(path: string): Promise<boolean> {
    try {
      return await this.app.vault.adapter.exists(path)
    } catch {
      return false
    }
  }

  async readJson(path: string): Promise<Record<string, unknown> | null> {
    try {
      const exists = await this.exists(path)
      if (!exists) {
        return null
      }
      const raw = await this.app.vault.adapter.read(path)
      const parsed: unknown = JSON.parse(raw)
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>
      }
      return null
    } catch (error) {
      console.warn(`[vault-renderer] Could not read JSON at ${path}:`, error)
      return null
    }
  }

  async writeJson(path: string, data: Record<string, unknown>): Promise<boolean> {
    try {
      const content = JSON.stringify(data, null, 2)
      await this.app.vault.adapter.write(path, content)
      return true
    } catch (error) {
      console.error(`[vault-renderer] Could not write JSON at ${path}:`, error)
      return false
    }
  }
}
