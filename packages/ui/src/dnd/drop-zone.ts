export type DropZone2D = 'top' | 'bottom' | 'left' | 'right' | 'center'

export interface DropZone2DThresholds {
  readonly topThreshold?: number
  readonly bottomThreshold?: number
  readonly leftThreshold?: number
  readonly rightThreshold?: number
}

function resolveEdgeZone(
  relX: number,
  relY: number,
  topThresh: number,
  bottomThresh: number,
  leftThresh: number,
  rightThresh: number
): DropZone2D {
  const inTop = relY < topThresh
  const inBottom = relY > bottomThresh
  const inLeft = relX < leftThresh
  const inRight = relX > rightThresh

  if (!inTop && !inBottom && !inLeft && !inRight) {
    return 'center'
  }

  const distTop = inTop ? relY : Number.POSITIVE_INFINITY
  const distBottom = inBottom ? 1 - relY : Number.POSITIVE_INFINITY
  const distLeft = inLeft ? relX : Number.POSITIVE_INFINITY
  const distRight = inRight ? 1 - relX : Number.POSITIVE_INFINITY

  const minDist = Math.min(distTop, distBottom, distLeft, distRight)
  if (minDist === distTop) return 'top'
  if (minDist === distBottom) return 'bottom'
  if (minDist === distLeft) return 'left'
  return 'right'
}

/**
 * Computes the 2D drop zone (top, bottom, left, right, center) within a rectangle
 * based on pointer coordinates.
 */
export function computeDropZone2D(
  rect: DOMRect | { left: number; top: number; width: number; height: number },
  clientX: number,
  clientY: number,
  thresholds?: DropZone2DThresholds
): DropZone2D {
  if (rect.width <= 0 || rect.height <= 0) {
    return 'center'
  }

  const topThresh = thresholds?.topThreshold ?? 0.25
  const bottomThresh = thresholds?.bottomThreshold ?? 0.75
  const leftThresh = thresholds?.leftThreshold ?? 0.25
  const rightThresh = thresholds?.rightThreshold ?? 0.75

  const relX = (clientX - rect.left) / rect.width
  const relY = (clientY - rect.top) / rect.height

  return resolveEdgeZone(relX, relY, topThresh, bottomThresh, leftThresh, rightThresh)
}
