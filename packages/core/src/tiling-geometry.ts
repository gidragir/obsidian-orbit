/**
 * Pure domain utilities for calculating tiling geometry and split ratios.
 * 0% dependencies on Obsidian API, DOM, or Node.js runtime.
 */

import type { TileNode } from './tiling-tree'

export interface RectBounds {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

/**
 * Clamps a ratio value between min and max bounds.
 */
export function clampRatio(ratio: number, minRatio = 0.15, maxRatio = 0.85): number {
  if (ratio < minRatio) return minRatio
  if (ratio > maxRatio) return maxRatio
  return ratio
}

/**
 * Calculates horizontal split ratio based on pointer X coordinate and container bounds.
 */
export function calculateHorizontalSplitRatio(
  pointerX: number,
  container: RectBounds,
  minRatio = 0.15,
  maxRatio = 0.85
): number {
  if (container.width <= 0) {
    return 0.5
  }
  const rawRatio = (pointerX - container.left) / container.width
  return clampRatio(rawRatio, minRatio, maxRatio)
}

/**
 * Calculates vertical split ratio between two adjacent rows based on pointer Y coordinate.
 */
export function calculateVerticalSplitRatio(
  pointerY: number,
  container: RectBounds,
  minRatio = 0.15,
  maxRatio = 0.85
): number {
  if (container.height <= 0) {
    return 0.5
  }
  const rawRatio = (pointerY - container.top) / container.height
  return clampRatio(rawRatio, minRatio, maxRatio)
}

export type Direction = 'left' | 'right' | 'up' | 'down'

export interface LeafNormalizedRect {
  readonly id: string
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

interface ComputeState {
  readonly rects: Map<string, LeafNormalizedRect>
}

function computeNodeRects(
  node: TileNode,
  x: number,
  y: number,
  width: number,
  height: number,
  state: ComputeState
): void {
  if (node.type === 'leaf') {
    state.rects.set(node.id, { id: node.id, x, y, width, height })
    return
  }

  const totalWeight = node.children.reduce((acc, child) => acc + (child.weight || 1), 0)
  if (totalWeight <= 0) return

  let currentCoord = node.direction === 'column' ? x : y

  for (const child of node.children) {
    const fraction = (child.weight || 1) / totalWeight
    if (node.direction === 'column') {
      const childWidth = width * fraction
      computeNodeRects(child, currentCoord, y, childWidth, height, state)
      currentCoord += childWidth
    } else {
      const childHeight = height * fraction
      computeNodeRects(child, x, currentCoord, width, childHeight, state)
      currentCoord += childHeight
    }
  }
}

/**
 * Computes normalized 0..1 bounding rects for each leaf in the tiling tree.
 */
export function computeTreeLayoutRects(root: TileNode): ReadonlyMap<string, LeafNormalizedRect> {
  const state: ComputeState = { rects: new Map() }
  computeNodeRects(root, 0, 0, 1, 1, state)
  return state.rects
}

function calculateDirectionalScore(
  source: LeafNormalizedRect,
  target: LeafNormalizedRect,
  direction: Direction
): number | null {
  let primaryDistance = 0
  let crossOverlap = 0
  let crossSpan = 1

  switch (direction) {
    case 'right':
      primaryDistance = target.x - (source.x + source.width)
      if (primaryDistance < -0.01) return null
      crossOverlap =
        Math.min(source.y + source.height, target.y + target.height) - Math.max(source.y, target.y)
      crossSpan = Math.max(0.001, Math.min(source.height, target.height))
      break
    case 'left':
      primaryDistance = source.x - (target.x + target.width)
      if (primaryDistance < -0.01) return null
      crossOverlap =
        Math.min(source.y + source.height, target.y + target.height) - Math.max(source.y, target.y)
      crossSpan = Math.max(0.001, Math.min(source.height, target.height))
      break
    case 'down':
      primaryDistance = target.y - (source.y + source.height)
      if (primaryDistance < -0.01) return null
      crossOverlap =
        Math.min(source.x + source.width, target.x + target.width) - Math.max(source.x, target.x)
      crossSpan = Math.max(0.001, Math.min(source.width, target.width))
      break
    case 'up':
      primaryDistance = source.y - (target.y + target.height)
      if (primaryDistance < -0.01) return null
      crossOverlap =
        Math.min(source.x + source.width, target.x + target.width) - Math.max(source.x, target.x)
      crossSpan = Math.max(0.001, Math.min(source.width, target.width))
      break
  }

  // Tier 1: Panels that have physical cross-axis overlap (e.g. sharing the same column/row)
  // Higher overlap fraction gives better score.
  if (crossOverlap > 0.001) {
    const overlapRatio = Math.min(1, crossOverlap / crossSpan)
    return Math.max(0, primaryDistance) * 10 - overlapRatio * 100
  }

  // Tier 2: Panels without cross-axis overlap (offset diagonally)
  // Penalty of +1000 ensures overlapping neighbors in the same column/row always win.
  const crossDistance =
    Math.abs(target.x + target.width / 2 - (source.x + source.width / 2)) +
    Math.abs(target.y + target.height / 2 - (source.y + source.height / 2))
  return 1000 + Math.max(0, primaryDistance) * 10 + crossDistance * 5
}

/**
 * Finds the nearest adjacent leaf in the specified direction.
 */
export function findAdjacentLeaf(
  root: TileNode,
  currentLeafId: string,
  direction: Direction
): string | null {
  const rects = computeTreeLayoutRects(root)
  const current = rects.get(currentLeafId)
  if (!current) return null

  let bestId: string | null = null
  let bestScore = Number.POSITIVE_INFINITY

  for (const [id, rect] of rects.entries()) {
    if (id === currentLeafId) continue
    const score = calculateDirectionalScore(current, rect, direction)
    if (score !== null && score < bestScore) {
      bestScore = score
      bestId = id
    }
  }

  return bestId
}
