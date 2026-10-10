/**
 * Pure immutable utility to move an element from one index to another within an array.
 * 0% dependencies on DOM or runtime APIs.
 */
export function reorderArray<T>(items: readonly T[], fromIndex: number, toIndex: number): T[] {
  const length = items.length
  if (length <= 1 || fromIndex === toIndex) {
    return [...items]
  }

  if (fromIndex < 0 || fromIndex >= length) {
    return [...items]
  }

  const targetIndex = Math.max(0, Math.min(length - 1, toIndex))
  if (fromIndex === targetIndex) {
    return [...items]
  }

  const result = [...items]
  const removed = result.splice(fromIndex, 1)
  if (removed.length > 0) {
    const item = removed[0] as T
    result.splice(targetIndex, 0, item)
  }
  return result
}
