import { describe, expect, it } from 'vitest'
import {
  calculateTelemetrySummary,
  findSlowestPlugins,
  formatDurationMs,
  TelemetryCollector,
} from './telemetry'

describe('telemetry', () => {
  it('collects boot telemetry accurately', () => {
    const collector = new TelemetryCollector(1000, 1050)

    collector.recordPhaseStart('instant', 1050)
    collector.recordPluginStart('plugin-a', 'instant', 1055)
    collector.recordPluginEnd('plugin-a', 1080, true)
    collector.recordPhaseEnd('instant', 1090)

    collector.recordPhaseStart('interactive', 1100)
    collector.recordPluginStart('plugin-b', 'interactive', 1105)
    collector.recordPluginEnd('plugin-b', 1140, true)
    collector.recordPhaseEnd('interactive', 1150)
    collector.markInteractive(1150)

    const record = collector.finishBoot(1300, 2, 450)

    expect(record.timeOrigin).toBe(1000)
    expect(record.interactiveTimestamp).toBe(1150)
    expect(record.coldStartDurationMs).toBe(150) // 1150 - 1000 from timeOrigin
    expect(record.phaseTimings.instant).toBe(40)
    expect(record.phaseTimings.interactive).toBe(50)
    expect(record.pluginTimings['plugin-a']?.durationMs).toBe(25)
    expect(record.pluginTimings['plugin-b']?.durationMs).toBe(35)
    expect(record.interactionPausesCount).toBe(2)
    expect(record.totalInteractionPauseMs).toBe(450)
  })

  it('correctly handles realistic performance.timeOrigin with relative performance.now() timestamps', () => {
    // Realistic: timeOrigin is Unix epoch ms, timestamps are relative ms
    const timeOrigin = 1_700_000_000_000
    const collector = new TelemetryCollector(timeOrigin, 50)

    collector.recordPhaseStart('instant', 60)
    collector.recordPhaseEnd('instant', 100)
    collector.recordPhaseStart('interactive', 100)
    collector.recordPhaseEnd('interactive', 240)
    collector.markInteractive(240)

    const record = collector.finishBoot(350, 1, 50)
    expect(record.timeOrigin).toBe(timeOrigin)
    expect(record.coldStartDurationMs).toBe(240) // 240ms from timeOrigin
    expect(record.interactiveTimestamp).toBe(timeOrigin + 240)
    expect(record.timestamp).toBe(timeOrigin + 350)
  })

  it('calculates history summaries and detects min/max/averages', () => {
    const history = [
      {
        timestamp: 1500,
        timeOrigin: 1000,
        interactiveTimestamp: 1200,
        coldStartDurationMs: 150,
        phaseTimings: { instant: 20, interactive: 50, deferred: 0, idle: 0 },
        pluginTimings: {},
        interactionPausesCount: 0,
        totalInteractionPauseMs: 0,
      },
      {
        timestamp: 2500,
        timeOrigin: 2000,
        interactiveTimestamp: 2350,
        coldStartDurationMs: 250,
        phaseTimings: { instant: 30, interactive: 70, deferred: 0, idle: 0 },
        pluginTimings: {},
        interactionPausesCount: 1,
        totalInteractionPauseMs: 100,
      },
    ]

    const summary = calculateTelemetrySummary(history)
    expect(summary.bootCount).toBe(2)
    expect(summary.avgColdStartMs).toBe(200)
    expect(summary.minColdStartMs).toBe(150)
    expect(summary.maxColdStartMs).toBe(250)
    expect(summary.avgInteractiveMs).toBe(200)
  })

  it('handles empty history in summary', () => {
    const summary = calculateTelemetrySummary([])
    expect(summary.bootCount).toBe(0)
    expect(summary.avgColdStartMs).toBe(0)
  })

  it('sorts and identifies slowest plugins', () => {
    const record = {
      timestamp: 3000,
      timeOrigin: 1000,
      interactiveTimestamp: 1500,
      coldStartDurationMs: 400,
      phaseTimings: { instant: 10, interactive: 50, deferred: 20, idle: 100 },
      pluginTimings: {
        'fast-plugin': {
          phase: 'interactive' as const,
          durationMs: 15,
          startedAt: 1100,
          success: true,
        },
        'slow-plugin': {
          phase: 'deferred' as const,
          durationMs: 120,
          startedAt: 1200,
          success: true,
        },
        'medium-plugin': {
          phase: 'instant' as const,
          durationMs: 45,
          startedAt: 1050,
          success: true,
        },
      },
      interactionPausesCount: 0,
      totalInteractionPauseMs: 0,
    }

    const slowest = findSlowestPlugins(record, 2)
    expect(slowest.length).toBe(2)
    expect(slowest[0]?.id).toBe('slow-plugin')
    expect(slowest[0]?.durationMs).toBe(120)
    expect(slowest[1]?.id).toBe('medium-plugin')
    expect(slowest[1]?.durationMs).toBe(45)
  })

  it('formats milliseconds durations cleanly and human-readably', () => {
    expect(formatDurationMs(0)).toBe('0 ms')
    expect(formatDurationMs(-10)).toBe('0 ms')
    expect(formatDurationMs(0.0999999962747097)).toBe('0.1 ms')
    expect(formatDurationMs(0.84)).toBe('0.8 ms')
    expect(formatDurationMs(15.2)).toBe('15 ms')
    expect(formatDurationMs(450)).toBe('450 ms')
    expect(formatDurationMs(2448.500000009313)).toBe('2.4 s')
    expect(formatDurationMs(40003)).toBe('40.0 s')
    expect(formatDurationMs(65000)).toBe('1m 5s')
    expect(formatDurationMs(537246)).toBe('8m 57s')
  })
})
