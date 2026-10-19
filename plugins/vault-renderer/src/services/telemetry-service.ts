import {
  calculateTelemetrySummary,
  findSlowestPlugins,
  TelemetryCollector,
  type TelemetrySummary,
} from '@core/telemetry'
import type { StartupPhase, TelemetryBootRecord, VaultRendererSettings } from '@core/types'

const MAX_HISTORY_LENGTH = 10

export class TelemetryService {
  private collector: TelemetryCollector | null = null
  private readonly getSettings: () => VaultRendererSettings
  private readonly saveSettings: (settings: VaultRendererSettings) => Promise<void>

  constructor(
    getSettings: () => VaultRendererSettings,
    saveSettings: (settings: VaultRendererSettings) => Promise<void>
  ) {
    this.getSettings = getSettings
    this.saveSettings = saveSettings
  }

  startBootSession(): void {
    const timeOrigin =
      typeof performance !== 'undefined' && typeof performance.timeOrigin === 'number'
        ? performance.timeOrigin
        : Date.now()
    const bootStart = typeof performance !== 'undefined' ? performance.now() : Date.now()

    this.collector = new TelemetryCollector(timeOrigin, bootStart)
  }

  recordPhaseStart(phase: StartupPhase): void {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    this.collector?.recordPhaseStart(phase, now)
  }

  recordPhaseEnd(phase: StartupPhase): void {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    this.collector?.recordPhaseEnd(phase, now)
  }

  recordPluginStart(pluginId: string, phase: StartupPhase): void {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    this.collector?.recordPluginStart(pluginId, phase, now)
  }

  recordPluginEnd(pluginId: string, success: boolean, error?: string): void {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    this.collector?.recordPluginEnd(pluginId, now, success, error)
  }

  markInteractive(): void {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    this.collector?.markInteractive(now)
  }

  async finishBootSession(
    pausesCount: number,
    totalPauseMs: number
  ): Promise<TelemetryBootRecord | null> {
    if (!this.collector) {
      return null
    }

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    const record = this.collector.finishBoot(now, pausesCount, totalPauseMs)

    const currentSettings = this.getSettings()
    const updatedHistory = [record, ...currentSettings.telemetryHistory].slice(
      0,
      MAX_HISTORY_LENGTH
    )

    await this.saveSettings({
      ...currentSettings,
      telemetryHistory: updatedHistory,
    })

    return record
  }

  getSummary(): TelemetrySummary {
    const current = this.getSettings()
    return calculateTelemetrySummary(current.telemetryHistory)
  }

  getLatestRecord(): TelemetryBootRecord | null {
    const current = this.getSettings()
    return current.telemetryHistory[0] ?? null
  }

  getSlowestPluginsFromLatest(limit = 5) {
    const latest = this.getLatestRecord()
    if (!latest) {
      return []
    }
    return findSlowestPlugins(latest, limit)
  }
}
