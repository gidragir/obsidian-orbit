import type { App } from 'obsidian'

export interface InterceptorHooks {
  readonly onSaveIntercepted: () => Promise<void>
}

type SaveConfigFn = () => Promise<void>

export class ObsidianPluginInterceptor {
  private readonly app: App
  private originalSaveConfig: SaveConfigFn | null = null
  private isInstalled = false

  constructor(app: App) {
    this.app = app
  }

  private getManagerRecord(): Record<string, unknown> | null {
    const candidate = (this.app as unknown as Record<string, unknown>).plugins
    if (typeof candidate === 'object' && candidate !== null) {
      return candidate as Record<string, unknown>
    }
    return null
  }

  install(hooks: InterceptorHooks): void {
    if (this.isInstalled) {
      return
    }

    const manager = this.getManagerRecord()
    if (!manager) {
      return
    }

    if (typeof manager.saveConfig === 'function') {
      this.originalSaveConfig = (manager.saveConfig as SaveConfigFn).bind(manager)
      manager.saveConfig = async (): Promise<void> => {
        try {
          await hooks.onSaveIntercepted()
        } catch (err) {
          console.error('[vault-renderer] Intercepted saveConfig failed:', err)
        }
      }
      this.isInstalled = true
    }
  }

  uninstall(): void {
    if (!this.isInstalled) {
      return
    }

    const manager = this.getManagerRecord()
    if (manager && this.originalSaveConfig) {
      manager.saveConfig = this.originalSaveConfig
    }

    this.originalSaveConfig = null
    this.isInstalled = false
  }
}
