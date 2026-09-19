export function reorderTabs<T>(items: readonly T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex < 0 ||
    fromIndex >= items.length ||
    toIndex < 0 ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return [...items]
  }

  const result = [...items]
  const [removed] = result.splice(fromIndex, 1)
  if (removed !== undefined) {
    result.splice(toIndex, 0, removed)
  }
  return result
}
