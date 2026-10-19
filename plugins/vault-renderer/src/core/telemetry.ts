import type { PluginTimingRecord, StartupPhase, TelemetryBootRecord } from './types'

export interface TelemetrySummary {
  readonly bootCount: number
  readonly avgColdStartMs: number
  readonly minColdStartMs: number
  readonly maxColdStartMs: number
  readonly avgInteractiveMs: number
}

export interface SlowPluginEntry {
  readonly id: string
  readonly durationMs: number
  readonly phase: StartupPhase
}

export class TelemetryCollector {
  private readonly timeOrigin: number
  private readonly bootStartTime: number
  private interactiveTime = 0
  private readonly phaseStarts: Map<StartupPhase, number> = new Map()
  private readonly phaseDurations: Record<StartupPhase, number> = {
    instant: 0,
    interactive: 0,
    deferred: 0,
    idle: 0,
  }
  private readonly pluginStartTimes: Map<string, { phase: StartupPhase; startTime: number }> =
    new Map()
  private readonly pluginTimings: Record<string, PluginTimingRecord> = {}

  constructor(timeOrigin: number, bootStartTime: number) {
    this.timeOrigin = timeOrigin
    this.bootStartTime = bootStartTime
  }

  getBootStartTime(): number {
    return this.bootStartTime
  }

  recordPhaseStart(phase: StartupPhase, timestamp: number): void {
    this.phaseStarts.set(phase, timestamp)
  }

  recordPhaseEnd(phase: StartupPhase, timestamp: number): void {
    const started = this.phaseStarts.get(phase)
    if (started !== undefined) {
      this.phaseDurations[phase] = Math.max(0, timestamp - started)
    }
  }

  recordPluginStart(pluginId: string, phase: StartupPhase, timestamp: number): void {
    this.pluginStartTimes.set(pluginId, { phase, startTime: timestamp })
  }

  recordPluginEnd(pluginId: string, timestamp: number, success: boolean, error?: string): void {
    const startInfo = this.pluginStartTimes.get(pluginId)
    const startedAt = startInfo?.startTime ?? timestamp
    const phase = startInfo?.phase ?? 'interactive'
    const durationMs = Math.max(0, timestamp - startedAt)

    const record: PluginTimingRecord = {
      phase,
      durationMs,
      startedAt,
      success,
      ...(error ? { error } : {}),
    }

    this.pluginTimings[pluginId] = record
  }

  markInteractive(timestamp: number): void {
    if (this.interactiveTime === 0) {
      this.interactiveTime = timestamp
    }
  }

  finishBoot(
    endTimestamp: number,
    interactionPausesCount: number,
    totalInteractionPauseMs: number
  ): TelemetryBootRecord {
    const effectiveInteractive = this.interactiveTime > 0 ? this.interactiveTime : endTimestamp
    // If endTimestamp is relative to timeOrigin (i.e. performance.now()), coldStartDurationMs is effectiveInteractive
    // If endTimestamp is absolute epoch, difference from timeOrigin gives elapsed ms
    const isRelative = this.timeOrigin > 1_000_000_000 && endTimestamp < 1_000_000_000
    const coldStartDurationMs = Math.max(
      0,
      Math.round(isRelative ? effectiveInteractive : effectiveInteractive - this.timeOrigin)
    )
    const absoluteInteractive = isRelative
      ? Math.round(this.timeOrigin + effectiveInteractive)
      : effectiveInteractive
    const absoluteEnd = isRelative ? Math.round(this.timeOrigin + endTimestamp) : endTimestamp

    return {
      timestamp: absoluteEnd,
      timeOrigin: this.timeOrigin,
      interactiveTimestamp: absoluteInteractive,
      coldStartDurationMs,
      phaseTimings: { ...this.phaseDurations },
      pluginTimings: { ...this.pluginTimings },
      interactionPausesCount,
      totalInteractionPauseMs,
    }
  }
}

export function calculateTelemetrySummary(
  history: readonly TelemetryBootRecord[]
): TelemetrySummary {
  if (history.length === 0) {
    return {
      bootCount: 0,
      avgColdStartMs: 0,
      minColdStartMs: 0,
      maxColdStartMs: 0,
      avgInteractiveMs: 0,
    }
  }

  let totalColdStart = 0
  let minColdStart = Number.POSITIVE_INFINITY
  let maxColdStart = 0
  let totalInteractive = 0

  for (const record of history) {
    totalColdStart += record.coldStartDurationMs
    if (record.coldStartDurationMs < minColdStart) {
      minColdStart = record.coldStartDurationMs
    }
    if (record.coldStartDurationMs > maxColdStart) {
      maxColdStart = record.coldStartDurationMs
    }

    const interactiveDuration =
      record.coldStartDurationMs > 0
        ? record.coldStartDurationMs
        : Math.max(0, record.interactiveTimestamp - record.timeOrigin)
    totalInteractive += interactiveDuration
  }

  const count = history.length
  return {
    bootCount: count,
    avgColdStartMs: Math.round(totalColdStart / count),
    minColdStartMs: minColdStart === Number.POSITIVE_INFINITY ? 0 : minColdStart,
    maxColdStartMs: maxColdStart,
    avgInteractiveMs: Math.round(totalInteractive / count),
  }
}

export function findSlowestPlugins(
  record: TelemetryBootRecord,
  limit = 5
): readonly SlowPluginEntry[] {
  const entries: SlowPluginEntry[] = []

  for (const [id, timing] of Object.entries(record.pluginTimings)) {
    entries.push({
      id,
      durationMs: timing.durationMs,
      phase: timing.phase,
    })
  }

  entries.sort((a, b) => b.durationMs - a.durationMs)
  return entries.slice(0, limit)
}

export function formatDurationMs(ms: number): string {
  if (ms <= 0) {
    return '0 ms'
  }
  if (ms < 1) {
    return `${Number(ms.toFixed(1))} ms`
  }
  if (ms < 1000) {
    return `${Math.round(ms)} ms`
  }
  if (ms < 60_000) {
    return `${(ms / 1000).toFixed(1)} s`
  }
  const minutes = Math.floor(ms / 60_000)
  const seconds = Math.round((ms % 60_000) / 1000)
  return `${minutes}m ${seconds}s`
}
