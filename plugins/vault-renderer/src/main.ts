import { DomInteractionAdapter } from '@adapters/dom-interaction-adapter'
import { ObsidianPlatformAdapter } from '@adapters/obsidian-platform-adapter'
import { ObsidianPluginAdapter } from '@adapters/obsidian-plugin-adapter'
import { ObsidianStorageAdapter } from '@adapters/obsidian-storage-adapter'
import type { SlowPluginEntry, TelemetrySummary } from '@core/telemetry'
import type {
  InstalledPluginInfo,
  PlatformType,
  TelemetryBootRecord,
  VaultRendererSettings,
} from '@core/types'
import { SchedulerService } from '@services/scheduler-service'
import { ShadowStorageService } from '@services/shadow-storage-service'
import { TelemetryService } from '@services/telemetry-service'
import { DEFAULT_SETTINGS, normalizeSettings } from '@settings/settings'
import { type VaultRendererHost, VaultRendererSettingTab } from '@settings/settings-tab'
import { Plugin } from 'obsidian'

export default class VaultRendererPlugin extends Plugin implements VaultRendererHost {
  settings: VaultRendererSettings = DEFAULT_SETTINGS
  private pluginAdapter: ObsidianPluginAdapter | null = null
  private platformAdapter: ObsidianPlatformAdapter | null = null
  private storageAdapter: ObsidianStorageAdapter | null = null
  private domAdapter: DomInteractionAdapter | null = null
  private telemetryService: TelemetryService | null = null
  private shadowStorageService: ShadowStorageService | null = null
  private schedulerService: SchedulerService | null = null

  async onload(): Promise<void> {
    await this.loadPluginSettings()
    this.initAdaptersAndServices()
    this.registerSettings()
    this.registerCommands()
    this.startLifecycle()
  }

  onunload(): void {
    this.schedulerService?.teardown()
    this.shadowStorageService?.teardown()
    this.domAdapter?.detach()
  }

  getSettings(): VaultRendererSettings {
    return this.settings
  }

  async updateSettings(partial: Partial<VaultRendererSettings>): Promise<void> {
    this.settings = {
      ...this.settings,
      ...partial,
    }
    await this.saveData(this.settings)
  }

  getInstalledPlugins(): Record<string, InstalledPluginInfo> {
    return this.pluginAdapter?.getInstalledPlugins() ?? {}
  }

  getCurrentPlatform(): PlatformType {
    return this.platformAdapter?.getCurrentPlatform() ?? 'desktop'
  }

  getTelemetrySummary(): TelemetrySummary {
    return (
      this.telemetryService?.getSummary() ?? {
        bootCount: 0,
        avgColdStartMs: 0,
        minColdStartMs: 0,
        maxColdStartMs: 0,
        avgInteractiveMs: 0,
      }
    )
  }

  getLatestTelemetry(): TelemetryBootRecord | null {
    return this.telemetryService?.getLatestRecord() ?? null
  }

  getSlowestPlugins(limit = 5): readonly SlowPluginEntry[] {
    return this.telemetryService?.getSlowestPluginsFromLatest(limit) ?? []
  }

  async clearTelemetryHistory(): Promise<void> {
    await this.updateSettings({ telemetryHistory: [] })
  }

  isPluginCurrentlyEnabled(id: string): boolean {
    return this.pluginAdapter?.isPluginCurrentlyEnabled(id) ?? false
  }

  async togglePlugin(id: string, enabled: boolean): Promise<void> {
    if (!this.pluginAdapter) {
      return
    }
    await this.pluginAdapter.togglePlugin(id, enabled)
  }

  private async loadPluginSettings(): Promise<void> {
    const loadedData = (await this.loadData()) as unknown
    const tempPluginAdapter = new ObsidianPluginAdapter(this.app)
    const tempPlatformAdapter = new ObsidianPlatformAdapter()
    const installed = Object.keys(tempPluginAdapter.getInstalledPlugins())
    const enabledIds = tempPluginAdapter.getEnabledPluginIds()
    this.settings = normalizeSettings(
      loadedData,
      installed,
      enabledIds,
      tempPlatformAdapter.getCurrentPlatform()
    )
  }

  private initAdaptersAndServices(): void {
    this.pluginAdapter = new ObsidianPluginAdapter(this.app)
    this.platformAdapter = new ObsidianPlatformAdapter()
    this.storageAdapter = new ObsidianStorageAdapter(this.app)

    this.telemetryService = new TelemetryService(
      () => this.settings,
      async (newSettings) => {
        this.settings = newSettings
        await this.saveData(this.settings)
      }
    )

    this.shadowStorageService = new ShadowStorageService(this.storageAdapter)
    if (this.settings.enableShadowStorage) {
      this.shadowStorageService.installHooks(
        (id) => this.settings.plugins[id],
        this.platformAdapter.getCurrentPlatform()
      )
    }

    this.domAdapter = new DomInteractionAdapter(() => {
      this.schedulerService?.onUserActivity()
    })

    this.schedulerService = new SchedulerService(
      this.pluginAdapter,
      this.platformAdapter,
      this.domAdapter,
      this.telemetryService,
      this.shadowStorageService,
      () => this.settings,
      this.manifest.id
    )
  }

  private registerSettings(): void {
    this.addSettingTab(new VaultRendererSettingTab(this.app, this, this))
  }

  private registerCommands(): void {
    this.addCommand({
      id: 'vault-renderer-run-scheduler',
      name: 'Vault Renderer: Run startup orchestration sequence',
      callback: async () => {
        await this.schedulerService?.executeStartupSequence()
      },
    })
  }

  private startLifecycle(): void {
    this.app.workspace.onLayoutReady(() => {
      void this.schedulerService?.executeStartupSequence()
    })
  }
}
