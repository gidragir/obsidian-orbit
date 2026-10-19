import type { PluginProfileConfig, StartupPhase } from './types'

export const PHASE_ORDER: readonly StartupPhase[] = ['instant', 'interactive', 'deferred', 'idle']

export const PHASE_RANK: Readonly<Record<StartupPhase, number>> = {
  instant: 0,
  interactive: 1,
  deferred: 2,
  idle: 3,
}

export interface PhaseQueueItem {
  readonly id: string
  readonly delayMs: number
}

export interface StartupPlan {
  readonly phases: Record<StartupPhase, readonly PhaseQueueItem[]>
  readonly executionOrder: readonly string[]
  readonly warnings: readonly string[]
  readonly hasCycle: boolean
}

function buildAdjacencyList(
  targetIds: readonly string[],
  configs: Record<string, PluginProfileConfig>,
  warnings: string[]
): Map<string, string[]> {
  const adj = new Map<string, string[]>()
  const idSet = new Set(targetIds)

  for (const id of targetIds) {
    const rawDeps = configs[id]?.dependencies ?? []
    const validDeps: string[] = []
    const seen = new Set<string>()

    for (const depId of rawDeps) {
      if (depId === id) {
        warnings.push(`Plugin '${id}' has a circular self-dependency on itself.`)
        continue
      }
      if (!idSet.has(depId)) {
        warnings.push(`Dependency '${depId}' for plugin '${id}' is not active or installed.`)
        continue
      }
      if (!seen.has(depId)) {
        seen.add(depId)
        validDeps.push(depId)
      }
    }

    adj.set(id, validDeps)
  }

  return adj
}

function buildDependentsGraph(
  targetIds: readonly string[],
  adj: Map<string, string[]>
): {
  readonly dependents: Map<string, string[]>
  readonly incomingCount: Map<string, number>
} {
  const dependents = new Map<string, string[]>()
  const incomingCount = new Map<string, number>()

  for (const id of targetIds) {
    dependents.set(id, [])
    const deps = adj.get(id) ?? []
    incomingCount.set(id, deps.length)
  }

  for (const [id, deps] of adj) {
    for (const dep of deps) {
      dependents.get(dep)?.push(id)
    }
  }

  return { dependents, incomingCount }
}

function traverseTopologicalQueue(
  queue: string[],
  dependents: Map<string, string[]>,
  incomingCount: Map<string, number>
): string[] {
  const sorted: string[] = []
  while (queue.length > 0) {
    const current = queue.shift()
    if (!current) break
    sorted.push(current)

    const nextNodes = dependents.get(current) ?? []
    for (const next of nextNodes) {
      const remaining = (incomingCount.get(next) ?? 1) - 1
      incomingCount.set(next, remaining)
      if (remaining === 0) {
        queue.push(next)
      }
    }
  }
  return sorted
}

function appendMissingNodes(targetIds: readonly string[], sorted: string[]): string[] {
  const processed = new Set(sorted)
  const result = [...sorted]
  for (const id of targetIds) {
    if (!processed.has(id)) {
      result.push(id)
    }
  }
  return result
}

export function topologicalSort(
  targetIds: readonly string[],
  adj: Map<string, string[]>
): { readonly sorted: readonly string[]; readonly hasCycle: boolean } {
  const { dependents, incomingCount } = buildDependentsGraph(targetIds, adj)
  const queue = targetIds.filter((id) => (incomingCount.get(id) ?? 0) === 0)
  const sorted = traverseTopologicalQueue(queue, dependents, incomingCount)
  const hasCycle = sorted.length !== targetIds.length

  return {
    sorted: hasCycle ? appendMissingNodes(targetIds, sorted) : sorted,
    hasCycle,
  }
}

function hoistDependenciesForPlugin(
  id: string,
  configs: Record<string, PluginProfileConfig>,
  effectivePhases: Map<string, StartupPhase>,
  warnings: string[]
): boolean {
  const currentPhase = effectivePhases.get(id) ?? 'interactive'
  const currentRank = PHASE_RANK[currentPhase]
  const deps = configs[id]?.dependencies ?? []
  let changed = false

  for (const depId of deps) {
    const depPhase = effectivePhases.get(depId)
    if (!depPhase) continue

    const depRank = PHASE_RANK[depPhase]
    if (depRank > currentRank) {
      effectivePhases.set(depId, currentPhase)
      warnings.push(
        `Hoisted dependency '${depId}' from phase '${depPhase}' to '${currentPhase}' because '${id}' depends on it.`
      )
      changed = true
    }
  }

  return changed
}

export function hoistPhases(
  targetIds: readonly string[],
  configs: Record<string, PluginProfileConfig>
): {
  readonly effectivePhases: Map<string, StartupPhase>
  readonly warnings: readonly string[]
} {
  const effectivePhases = new Map<string, StartupPhase>()
  const warnings: string[] = []

  for (const id of targetIds) {
    effectivePhases.set(id, configs[id]?.phase ?? 'interactive')
  }

  let changed = true
  let iterations = 0
  const maxIterations = targetIds.length

  while (changed && iterations < maxIterations) {
    changed = false
    iterations += 1

    for (const id of targetIds) {
      if (hoistDependenciesForPlugin(id, configs, effectivePhases, warnings)) {
        changed = true
      }
    }
  }

  return { effectivePhases, warnings }
}

export function planStartupQueue(
  configs: Record<string, PluginProfileConfig>,
  targetIds: readonly string[]
): StartupPlan {
  const warnings: string[] = []
  const adj = buildAdjacencyList(targetIds, configs, warnings)
  const { sorted, hasCycle } = topologicalSort(targetIds, adj)
  const { effectivePhases, warnings: hoistWarnings } = hoistPhases(targetIds, configs)

  warnings.push(...hoistWarnings)
  if (hasCycle) {
    warnings.push(
      'Circular dependency detected in plugin dependencies. Execution order may be partially degraded.'
    )
  }

  const phaseBuckets: Record<StartupPhase, PhaseQueueItem[]> = {
    instant: [],
    interactive: [],
    deferred: [],
    idle: [],
  }

  for (const id of sorted) {
    const phase = effectivePhases.get(id) ?? 'interactive'
    const delayMs = configs[id]?.delayMs ?? 0
    phaseBuckets[phase].push({ id, delayMs })
  }

  const executionOrder: string[] = []
  for (const phase of PHASE_ORDER) {
    for (const item of phaseBuckets[phase]) {
      executionOrder.push(item.id)
    }
  }

  return {
    phases: phaseBuckets,
    executionOrder,
    warnings,
    hasCycle,
  }
}
