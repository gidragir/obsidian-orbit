import type { DomInteractionAdapter } from '@adapters/dom-interaction-adapter'
import type { ObsidianPlatformAdapter } from '@adapters/obsidian-platform-adapter'
import type { ObsidianPluginAdapter } from '@adapters/obsidian-plugin-adapter'
import { type PhaseQueueItem, planStartupQueue } from '@core/dag-scheduler'
import { InteractionGuardCore } from '@core/interaction-guard'
import { evaluatePlatformMatrix } from '@core/platform-matrix'
import type { PlatformType, StartupPhase, VaultRendererSettings } from '@core/types'
import type { ShadowStorageService } from '@services/shadow-storage-service'
import type { TelemetryService } from '@services/telemetry-service'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class SchedulerService {
  private readonly pluginAdapter: ObsidianPluginAdapter
  private readonly platformAdapter: ObsidianPlatformAdapter
  private readonly domAdapter: DomInteractionAdapter
  private readonly telemetryService: TelemetryService
  private readonly shadowStorage: ShadowStorageService
  private readonly getSettings: () => VaultRendererSettings
  private readonly selfPluginId: string
  private readonly guard: InteractionGuardCore = new InteractionGuardCore()
  private isRunning = false

  constructor(
    pluginAdapter: ObsidianPluginAdapter,
    platformAdapter: ObsidianPlatformAdapter,
    domAdapter: DomInteractionAdapter,
    telemetryService: TelemetryService,
    shadowStorage: ShadowStorageService,
    getSettings: () => VaultRendererSettings,
    selfPluginId = 'vault-renderer'
  ) {
    this.pluginAdapter = pluginAdapter
    this.platformAdapter = platformAdapter
    this.domAdapter = domAdapter
    this.telemetryService = telemetryService
    this.shadowStorage = shadowStorage
    this.getSettings = getSettings
    this.selfPluginId = selfPluginId
  }

  onUserActivity(): void {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    this.guard.recordActivity(now)
  }

  private async waitForUserIdle(debounceMs: number): Promise<void> {
    let now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    while (this.guard.isBusy(now, debounceMs)) {
      this.guard.startPause(now)
      const waitTime = Math.max(100, this.guard.getRemainingBusyTime(now, debounceMs))
      await sleep(waitTime)
      now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    }
    this.guard.resume(now)
  }

  private async loadPluginItem(
    item: PhaseQueueItem,
    phase: StartupPhase,
    platform: PlatformType,
    debounceMs: number
  ): Promise<void> {
    if (phase === 'deferred' || phase === 'idle') {
      await this.waitForUserIdle(debounceMs)
    }

    if (item.delayMs > 0) {
      await sleep(item.delayMs)
    }

    const settings = this.getSettings()
    const pluginConfig = settings.plugins[item.id]
    const syncMode = pluginConfig?.syncMode ?? 'bidirectional'

    if (settings.enableShadowStorage) {
      await this.shadowStorage.preparePluginStorage(item.id, syncMode, platform)
    }

    this.telemetryService.recordPluginStart(item.id, phase)

    let success = true
    let errorMsg: string | undefined

    try {
      if (!this.pluginAdapter.isPluginEnabled(item.id)) {
        success = await this.pluginAdapter.enablePlugin(item.id)
      }
    } catch (err) {
      success = false
      errorMsg = String(err)
    }

    this.telemetryService.recordPluginEnd(item.id, success, errorMsg)
  }

  private async executePhase(
    phase: StartupPhase,
    items: readonly PhaseQueueItem[],
    platform: PlatformType,
    debounceMs: number
  ): Promise<void> {
    if (items.length === 0) {
      return
    }

    this.telemetryService.recordPhaseStart(phase)

    for (const item of items) {
      await this.loadPluginItem(item, phase, platform, debounceMs)
    }

    this.telemetryService.recordPhaseEnd(phase)

    if (phase === 'interactive') {
      this.telemetryService.markInteractive()
    }
  }

  private async applyPlatformFilter(
    platform: PlatformType,
    installedIds: readonly string[]
  ): Promise<readonly string[]> {
    const settings = this.getSettings()
    if (!settings.enablePlatformFilter) {
      const enabled = this.pluginAdapter.getEnabledPluginIds()
      return installedIds.filter((id) => enabled.has(id))
    }

    const { toEnable, toDisable } = evaluatePlatformMatrix(settings.plugins, platform, installedIds)

    for (const id of toDisable) {
      // Guard against accidentally disabling self
      if (id !== this.selfPluginId && this.pluginAdapter.isPluginEnabled(id)) {
        await this.pluginAdapter.disablePlugin(id)
      }
    }

    return toEnable.filter((id) => id !== this.selfPluginId)
  }

  async executeStartupSequence(): Promise<void> {
    if (this.isRunning) {
      return
    }
    this.isRunning = true

    this.telemetryService.startBootSession()
    this.domAdapter.attach()

    const platform = this.platformAdapter.getCurrentPlatform()
    const settings = this.getSettings()
    const installed = Object.keys(this.pluginAdapter.getInstalledPlugins()).filter(
      (id) => id !== this.selfPluginId
    )

    const targetPluginIds = await this.applyPlatformFilter(platform, installed)

    if (settings.enableScheduler) {
      const plan = planStartupQueue(settings.plugins, targetPluginIds)

      await this.executePhase(
        'instant',
        plan.phases.instant,
        platform,
        settings.interactionGuardTimeoutMs
      )
      await this.executePhase(
        'interactive',
        plan.phases.interactive,
        platform,
        settings.interactionGuardTimeoutMs
      )

      if (plan.phases.deferred.length > 0 && settings.deferredPhaseDelayMs > 0) {
        await sleep(settings.deferredPhaseDelayMs)
      }
      await this.executePhase(
        'deferred',
        plan.phases.deferred,
        platform,
        settings.interactionGuardTimeoutMs
      )

      if (plan.phases.idle.length > 0 && settings.idlePhaseDelayMs > 0) {
        await sleep(settings.idlePhaseDelayMs)
      }
      await this.executePhase(
        'idle',
        plan.phases.idle,
        platform,
        settings.interactionGuardTimeoutMs
      )
    } else {
      // If scheduler is disabled, immediately enable all permitted target plugins
      for (const id of targetPluginIds) {
        if (!this.pluginAdapter.isPluginEnabled(id)) {
          await this.pluginAdapter.enablePlugin(id)
        }
      }
      this.telemetryService.markInteractive()
    }

    const guardState = this.guard.getState()
    await this.telemetryService.finishBootSession(
      guardState.interactionPausesCount,
      guardState.totalInteractionPauseMs
    )

    this.isRunning = false
  }

  teardown(): void {
    this.domAdapter.detach()
    this.guard.reset()
    this.isRunning = false
  }
}
