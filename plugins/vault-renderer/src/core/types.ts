export type StartupPhase = 'instant' | 'interactive' | 'deferred' | 'idle'

export type SyncMode = 'bidirectional' | 'to-cloud' | 'from-cloud' | 'isolated'

export type PlatformType = 'desktop' | 'mobile'

export type PluginPlatformFilter = 'all' | 'desktop-only' | 'mobile-only' | 'disabled'

export interface PluginProfileConfig {
  readonly id: string
  readonly enabled: boolean
  readonly filter: PluginPlatformFilter
  readonly phase: StartupPhase
  readonly delayMs: number
  readonly dependencies: readonly string[]
  readonly syncMode: SyncMode
}

export interface PluginTimingRecord {
  readonly phase: StartupPhase
  readonly durationMs: number
  readonly startedAt: number
  readonly success: boolean
  readonly error?: string
}

export interface TelemetryBootRecord {
  readonly timestamp: number
  readonly timeOrigin: number
  readonly interactiveTimestamp: number
  readonly coldStartDurationMs: number
  readonly phaseTimings: Record<StartupPhase, number>
  readonly pluginTimings: Record<string, PluginTimingRecord>
  readonly interactionPausesCount: number
  readonly totalInteractionPauseMs: number
}

export interface VaultRendererSettings {
  readonly enableScheduler: boolean
  readonly enablePlatformFilter: boolean
  readonly enableShadowStorage: boolean
  readonly enableTelemetry: boolean
  readonly enableBootstrapSync: boolean
  readonly interactionGuardTimeoutMs: number
  readonly deferredPhaseDelayMs: number
  readonly idlePhaseDelayMs: number
  readonly plugins: Record<string, PluginProfileConfig>
  readonly telemetryHistory: readonly TelemetryBootRecord[]
}

export interface BootstrapSyncStatus {
  readonly isEnabled: boolean
  readonly bootstrapCount: number
  readonly totalActiveCount: number
  readonly deferredCount: number
  readonly backupExists: boolean
}

export interface InstalledPluginInfo {
  readonly id: string
  readonly name: string
  readonly version: string
  readonly description: string
}
