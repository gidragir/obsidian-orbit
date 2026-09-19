import { describe, expect, it } from 'vitest'
import { reorderTabs } from './reorder'

describe('reorderTabs', () => {
  it('reorders elements forward', () => {
    const list = ['a', 'b', 'c', 'd']
    expect(reorderTabs(list, 0, 2)).toEqual(['b', 'c', 'a', 'd'])
  })

  it('reorders elements backward', () => {
    const list = ['a', 'b', 'c', 'd']
    expect(reorderTabs(list, 3, 1)).toEqual(['a', 'd', 'b', 'c'])
  })

  it('returns clone of items if indices are equal or out of bounds', () => {
    const list = ['a', 'b']
    expect(reorderTabs(list, 1, 1)).toEqual(['a', 'b'])
    expect(reorderTabs(list, -1, 1)).toEqual(['a', 'b'])
    expect(reorderTabs(list, 0, 5)).toEqual(['a', 'b'])
  })
})
