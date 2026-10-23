export type ListDropZone = 'before' | 'after'
/**
 * Resolves where a dragged list item lands when dropped onto another item: it takes the
 * target's place, so moving forward lands after the target and backward before it.
 */
export function computeSortZone(fromIndex: number, targetIndex: number): ListDropZone {
  return fromIndex < targetIndex ? 'after' : 'before'
}

/**
 * Converts a drop slot ("before/after the target") into the final index of the moved
 * item once it has been removed from its original position.
 */
export function computeInsertIndex(
  fromIndex: number,
  targetIndex: number,
  zone: ListDropZone
): number {
  const slot = zone === 'after' ? targetIndex + 1 : targetIndex
  return fromIndex < slot ? slot - 1 : slot
}

/**
 * Follows an item with the given index through a move of `fromIndex` to `toIndex`.
 */
export function remapIndexAfterMove(index: number, fromIndex: number, toIndex: number): number {
  if (index === fromIndex) {
    return toIndex
  }
  if (fromIndex < index && index <= toIndex) {
    return index - 1
  }
  if (toIndex <= index && index < fromIndex) {
    return index + 1
  }
  return index
}
