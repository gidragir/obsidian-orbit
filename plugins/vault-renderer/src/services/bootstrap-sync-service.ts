import type { CanaryStorageAdapter } from '@adapters/canary-storage-adapter'
import type { CommunityPluginsAdapter } from '@adapters/community-plugins-adapter'
import type { ObsidianPlatformAdapter } from '@adapters/obsidian-platform-adapter'
import type { ObsidianPluginAdapter } from '@adapters/obsidian-plugin-adapter'
import type { ObsidianPluginInterceptor } from '@adapters/obsidian-plugin-interceptor'
import { computeBootstrapPluginIds, computeFullActivePluginIds } from '@core/bootstrap-sync'
import { evaluateCanaryOnStartup, markCanarySuccess } from '@core/crash-canary'
import { createDefaultPluginConfig } from '@core/platform-matrix'
import type { BootstrapSyncStatus, PlatformType, VaultRendererSettings } from '@core/types'
import { type App, type EventRef, Notice } from 'obsidian'

export class BootstrapSyncService {
  private readonly app: App
  private readonly communityPluginsAdapter: CommunityPluginsAdapter
  private readonly canaryAdapter: CanaryStorageAdapter
  private readonly pluginAdapter: ObsidianPluginAdapter
  private readonly platformAdapter: ObsidianPlatformAdapter
  private readonly pluginInterceptor: ObsidianPluginInterceptor
  private readonly getSettings: () => VaultRendererSettings
  private readonly updateSettings: (partial: Partial<VaultRendererSettings>) => Promise<void>
  private readonly selfPluginId: string

  private isAppQuitting = false
  private beforeUnloadHandler: (() => void) | null = null
  private quitEventRef: EventRef | null = null

  constructor(
    app: App,
    communityPluginsAdapter: CommunityPluginsAdapter,
    canaryAdapter: CanaryStorageAdapter,
    pluginAdapter: ObsidianPluginAdapter,
    platformAdapter: ObsidianPlatformAdapter,
    pluginInterceptor: ObsidianPluginInterceptor,
    getSettings: () => VaultRendererSettings,
    updateSettings: (partial: Partial<VaultRendererSettings>) => Promise<void>,
    selfPluginId = 'vault-renderer'
  ) {
    this.app = app
    this.communityPluginsAdapter = communityPluginsAdapter
    this.canaryAdapter = canaryAdapter
    this.pluginAdapter = pluginAdapter
    this.platformAdapter = platformAdapter
    this.pluginInterceptor = pluginInterceptor
    this.getSettings = getSettings
    this.updateSettings = updateSettings
    this.selfPluginId = selfPluginId
  }

  async initOnStartup(): Promise<void> {
    const canaryRecord = this.canaryAdapter.getCanary()
    const evaluation = evaluateCanaryOnStartup(canaryRecord, Date.now())
    this.canaryAdapter.setCanary(evaluation.nextRecord)

    if (evaluation.shouldRecover) {
      console.warn('[vault-renderer] Crash canary triggered recovery! Restoring backup...')
      await this.updateSettings({ enableBootstrapSync: false })
      await this.restoreFullNativePlugins()
      new Notice(
        'Vault Renderer: Startup crash loop detected. Restored community plugins from backup and disabled bootstrap optimization.'
      )
      return
    }

    this.installLifecycleGuards()

    const settings = this.getSettings()
    if (settings.enableBootstrapSync) {
      await this.syncBootstrap()
      this.pluginInterceptor.install({
        onSaveIntercepted: async () => {
          await this.handleSaveIntercepted()
        },
      })
    }
  }

  async onSettingChanged(enabled: boolean): Promise<void> {
    if (enabled) {
      this.pluginInterceptor.install({
        onSaveIntercepted: async () => {
          await this.handleSaveIntercepted()
        },
      })
      await this.syncBootstrap()
    } else {
      this.pluginInterceptor.uninstall()
      await this.restoreFullNativePlugins()
    }
  }

  private installLifecycleGuards(): void {
    this.beforeUnloadHandler = () => {
      this.isAppQuitting = true
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.beforeUnloadHandler)
    }

    const workspaceRecord = this.app.workspace as unknown as {
      on?: (name: string, callback: () => void) => EventRef
    }
    if (typeof workspaceRecord.on === 'function') {
      this.quitEventRef = workspaceRecord.on('quit', () => {
        this.isAppQuitting = true
      })
    }
  }

  markStartupSuccess(): void {
    this.canaryAdapter.setCanary(markCanarySuccess(Date.now()))
  }

  private getInstalledIds(): readonly string[] {
    return Object.keys(this.pluginAdapter.getInstalledPlugins())
  }

  private getCurrentPlatform(): PlatformType {
    return this.platformAdapter.getCurrentPlatform()
  }

  computeCurrentBootstrapIds(options?: { excludeSelf?: boolean }): readonly string[] {
    const settings = this.getSettings()
    return computeBootstrapPluginIds({
      plugins: settings.plugins,
      selfPluginId: this.selfPluginId,
      installedPluginIds: this.getInstalledIds(),
      currentPlatform: this.getCurrentPlatform(),
      excludeSelf: options?.excludeSelf,
    })
  }

  computeCurrentFullActiveIds(options?: { excludeSelf?: boolean }): readonly string[] {
    const settings = this.getSettings()
    return computeFullActivePluginIds({
      plugins: settings.plugins,
      selfPluginId: this.selfPluginId,
      installedPluginIds: this.getInstalledIds(),
      currentPlatform: this.getCurrentPlatform(),
      excludeSelf: options?.excludeSelf,
    })
  }

  async syncBootstrap(): Promise<boolean> {
    const fullActive = this.computeCurrentFullActiveIds()
    const bootstrap = this.computeCurrentBootstrapIds()

    // Safeguard: protect backup from being overwritten with empty list if manifests failed to load
    const settings = this.getSettings()
    const configuredCount = Object.keys(settings.plugins).length
    if (fullActive.length <= 1 && configuredCount > 1) {
      console.warn(
        '[vault-renderer] Skipping backup overwrite: fullActive contains only self, but plugins are configured.'
      )
    } else {
      await this.communityPluginsAdapter.writeBackupPlugins(fullActive)
    }

    return await this.communityPluginsAdapter.writeCommunityPlugins(bootstrap)
  }

  async restoreFullNativePlugins(): Promise<boolean> {
    const backup = await this.communityPluginsAdapter.readBackupPlugins()
    const fullList = backup && backup.length > 0 ? backup : this.computeCurrentFullActiveIds()

    return await this.communityPluginsAdapter.writeCommunityPlugins(fullList)
  }

  private getRestoredFullListWithoutSelf(managerEnabled: ReadonlySet<string>): readonly string[] {
    const backupSync = this.communityPluginsAdapter.readBackupPluginsSync()
    const backupWithoutSelf = backupSync ? backupSync.filter((id) => id !== this.selfPluginId) : []

    const fullListFromConfig = this.computeCurrentFullActiveIds({ excludeSelf: true })

    if (backupWithoutSelf.length >= fullListFromConfig.length) {
      return backupWithoutSelf
    }
    if (fullListFromConfig.length >= managerEnabled.size) {
      return fullListFromConfig
    }
    return Array.from(managerEnabled).filter((id) => id !== this.selfPluginId)
  }

  private async reconcileSettingsWithManager(managerEnabled: ReadonlySet<string>): Promise<void> {
    const settings = this.getSettings()
    let changed = false
    const updated = { ...settings.plugins }

    for (const [id, cfg] of Object.entries(updated)) {
      if (id === this.selfPluginId) {
        continue
      }
      const isEnabled = managerEnabled.has(id)
      if (cfg.enabled !== isEnabled) {
        updated[id] = {
          ...cfg,
          enabled: isEnabled,
          filter: isEnabled && cfg.filter === 'disabled' ? 'all' : cfg.filter,
        }
        changed = true
      }
    }

    for (const enabledId of managerEnabled) {
      if (enabledId === this.selfPluginId) {
        continue
      }
      if (!updated[enabledId]) {
        updated[enabledId] = {
          ...createDefaultPluginConfig(enabledId),
          enabled: true,
          phase: 'deferred',
        }
        changed = true
      }
    }

    if (changed) {
      await this.updateSettings({ plugins: updated })
    }
  }

  async handleSaveIntercepted(): Promise<void> {
    const managerEnabled = this.pluginAdapter.getEnabledPluginIds()

    if (!managerEnabled.has(this.selfPluginId)) {
      this.pluginInterceptor.uninstall()
      const fullList = this.getRestoredFullListWithoutSelf(managerEnabled)
      await this.communityPluginsAdapter.writeCommunityPlugins(fullList)
      return
    }

    await this.reconcileSettingsWithManager(managerEnabled)
    await this.syncBootstrap()
  }

  async handlePluginToggle(id: string, enabled: boolean): Promise<void> {
    if (id === this.selfPluginId) {
      return
    }

    const settings = this.getSettings()
    const existing = settings.plugins[id] ?? createDefaultPluginConfig(id)
    const updated = {
      ...existing,
      enabled,
      filter: enabled && existing.filter === 'disabled' ? ('all' as const) : existing.filter,
    }

    await this.updateSettings({
      plugins: {
        ...settings.plugins,
        [id]: updated,
      },
    })

    if (enabled) {
      if (!this.pluginAdapter.isPluginEnabled(id)) {
        await this.pluginAdapter.enablePlugin(id)
      }
    } else {
      if (this.pluginAdapter.isPluginEnabled(id)) {
        await this.pluginAdapter.disablePlugin(id)
      }
    }

    if (this.getSettings().enableBootstrapSync) {
      await this.syncBootstrap()
    }
  }

  async getStatus(): Promise<BootstrapSyncStatus> {
    const settings = this.getSettings()
    const bootstrap = this.computeCurrentBootstrapIds()
    const fullActive = this.computeCurrentFullActiveIds()
    const backupExists = await this.communityPluginsAdapter.backupExists()

    return {
      isEnabled: settings.enableBootstrapSync,
      bootstrapCount: bootstrap.length,
      totalActiveCount: fullActive.length,
      deferredCount: Math.max(0, fullActive.length - bootstrap.length),
      backupExists,
    }
  }

  teardown(): void {
    if (this.beforeUnloadHandler && typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler)
      this.beforeUnloadHandler = null
    }

    if (this.quitEventRef) {
      this.app.workspace.offref(this.quitEventRef)
      this.quitEventRef = null
    }

    this.pluginInterceptor.uninstall()

    // If unloading but app is NOT quitting, the user manually disabled vault-renderer.
    // Restore the complete full list of community plugins so nothing is lost,
    // EXCLUDING vault-renderer so the user can successfully disable/uninstall it.
    if (!this.isAppQuitting) {
      const managerEnabled = this.pluginAdapter.getEnabledPluginIds()
      const fullList = this.getRestoredFullListWithoutSelf(managerEnabled)
      this.communityPluginsAdapter.writeCommunityPluginsSync(fullList)
    }
  }
}
