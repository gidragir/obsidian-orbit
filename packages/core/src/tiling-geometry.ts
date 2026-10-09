/**
 * Pure domain utilities for calculating tiling geometry and split ratios.
 * 0% dependencies on Obsidian API, DOM, or Node.js runtime.
 */

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
