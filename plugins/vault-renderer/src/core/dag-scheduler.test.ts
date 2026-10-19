import { describe, expect, it } from 'vitest'
import { hoistPhases, PHASE_ORDER, planStartupQueue, topologicalSort } from './dag-scheduler'
import type { PluginProfileConfig } from './types'

function makeConfig(
  id: string,
  phase: PluginProfileConfig['phase'] = 'interactive',
  dependencies: string[] = [],
  delayMs = 0
): PluginProfileConfig {
  return {
    id,
    enabled: true,
    filter: 'all',
    phase,
    delayMs,
    dependencies,
    syncMode: 'bidirectional',
  }
}

describe('dag-scheduler', () => {
  it('performs linear topological sort correctly', () => {
    // b depends on a, c depends on b
    const adj = new Map<string, string[]>([
      ['a', []],
      ['b', ['a']],
      ['c', ['b']],
    ])

    const { sorted, hasCycle } = topologicalSort(['c', 'a', 'b'], adj)
    expect(hasCycle).toBe(false)
    expect(sorted.indexOf('a')).toBeLessThan(sorted.indexOf('b'))
    expect(sorted.indexOf('b')).toBeLessThan(sorted.indexOf('c'))
  })

  it('handles diamond dependencies correctly', () => {
    // d depends on b and c; b and c depend on a
    const adj = new Map<string, string[]>([
      ['a', []],
      ['b', ['a']],
      ['c', ['a']],
      ['d', ['b', 'c']],
    ])

    const { sorted, hasCycle } = topologicalSort(['d', 'b', 'c', 'a'], adj)
    expect(hasCycle).toBe(false)
    expect(sorted[0]).toBe('a')
    expect(sorted.indexOf('a')).toBeLessThan(sorted.indexOf('b'))
    expect(sorted.indexOf('a')).toBeLessThan(sorted.indexOf('c'))
    expect(sorted.indexOf('b')).toBeLessThan(sorted.indexOf('d'))
    expect(sorted.indexOf('c')).toBeLessThan(sorted.indexOf('d'))
  })

  it('detects cycles and does not get stuck in infinite loop', () => {
    const adj = new Map<string, string[]>([
      ['a', ['b']],
      ['b', ['a']],
    ])

    const { sorted, hasCycle } = topologicalSort(['a', 'b'], adj)
    expect(hasCycle).toBe(true)
    expect(sorted.length).toBe(2)
  })

  it('hoists dependency phases when dependent plugin is earlier in lifecycle', () => {
    // core is configured as idle, but viewer (instant) depends on core
    const configs: Record<string, PluginProfileConfig> = {
      viewer: makeConfig('viewer', 'instant', ['core']),
      core: makeConfig('core', 'idle', []),
    }

    const { effectivePhases, warnings } = hoistPhases(['viewer', 'core'], configs)
    expect(effectivePhases.get('core')).toBe('instant')
    expect(effectivePhases.get('viewer')).toBe('instant')
    expect(warnings.length).toBe(1)
  })

  it('plans startup queue grouped by phases in proper order', () => {
    const configs: Record<string, PluginProfileConfig> = {
      theme: makeConfig('theme', 'instant'),
      core: makeConfig('core', 'interactive'),
      markdownHelper: makeConfig('markdownHelper', 'deferred', ['core']),
      heavyLinter: makeConfig('heavyLinter', 'idle', ['markdownHelper']),
    }

    const plan = planStartupQueue(configs, ['heavyLinter', 'markdownHelper', 'core', 'theme'])
    expect(plan.hasCycle).toBe(false)
    expect(plan.phases.instant.map((p) => p.id)).toEqual(['theme'])
    expect(plan.phases.interactive.map((p) => p.id)).toEqual(['core'])
    expect(plan.phases.deferred.map((p) => p.id)).toEqual(['markdownHelper'])
    expect(plan.phases.idle.map((p) => p.id)).toEqual(['heavyLinter'])
    expect(plan.executionOrder).toEqual(['theme', 'core', 'markdownHelper', 'heavyLinter'])
  })

  it('handles empty input gracefully', () => {
    const plan = planStartupQueue({}, [])
    expect(plan.hasCycle).toBe(false)
    expect(plan.executionOrder).toEqual([])
    for (const phase of PHASE_ORDER) {
      expect(plan.phases[phase]).toEqual([])
    }
  })

  it('handles 3-node cycle gracefully and preserves all plugins', () => {
    // a -> b -> c -> a
    const configs: Record<string, PluginProfileConfig> = {
      a: makeConfig('a', 'interactive', ['b']),
      b: makeConfig('b', 'deferred', ['c']),
      c: makeConfig('c', 'idle', ['a']),
    }

    const plan = planStartupQueue(configs, ['a', 'b', 'c'])
    expect(plan.hasCycle).toBe(true)
    expect(plan.warnings.some((w) => w.includes('Circular dependency'))).toBe(true)
    expect(plan.executionOrder.length).toBe(3)
    expect(new Set(plan.executionOrder)).toEqual(new Set(['a', 'b', 'c']))
  })

  it('handles self-dependencies and duplicate dependencies safely', () => {
    const configs: Record<string, PluginProfileConfig> = {
      a: makeConfig('a', 'interactive', ['a', 'b', 'b']),
      b: makeConfig('b', 'instant', []),
    }

    const plan = planStartupQueue(configs, ['a', 'b'])
    expect(plan.hasCycle).toBe(false)
    expect(plan.warnings.some((w) => w.includes('circular self-dependency'))).toBe(true)
    expect(plan.executionOrder).toEqual(['b', 'a'])
  })

  it('warns when a required dependency is missing or inactive', () => {
    const configs: Record<string, PluginProfileConfig> = {
      consumer: makeConfig('consumer', 'interactive', ['non-existent-plugin']),
    }

    const plan = planStartupQueue(configs, ['consumer'])
    expect(plan.warnings.some((w) => w.includes("Dependency 'non-existent-plugin'"))).toBe(true)
    expect(plan.executionOrder).toEqual(['consumer'])
  })
})
