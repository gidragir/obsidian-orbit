import { describe, expect, it } from 'vitest'
import { reorderArray } from './array'

describe('reorderArray', () => {
  it('moves item forwards', () => {
    const list = ['a', 'b', 'c', 'd']
    const result = reorderArray(list, 0, 2)
    expect(result).toEqual(['b', 'c', 'a', 'd'])
    expect(list).toEqual(['a', 'b', 'c', 'd']) // immutable
  })

  it('moves item backwards', () => {
    const list = ['a', 'b', 'c', 'd']
    const result = reorderArray(list, 3, 1)
    expect(result).toEqual(['a', 'd', 'b', 'c'])
  })

  it('returns copy if fromIndex equals toIndex', () => {
    const list = ['a', 'b', 'c']
    const result = reorderArray(list, 1, 1)
    expect(result).toEqual(['a', 'b', 'c'])
    expect(result).not.toBe(list)
  })

  it('handles single item or empty array', () => {
    expect(reorderArray([], 0, 1)).toEqual([])
    expect(reorderArray(['only'], 0, 0)).toEqual(['only'])
  })

  it('returns copy if fromIndex is out of bounds', () => {
    const list = ['a', 'b', 'c']
    expect(reorderArray(list, -1, 1)).toEqual(['a', 'b', 'c'])
    expect(reorderArray(list, 5, 1)).toEqual(['a', 'b', 'c'])
  })

  it('clamps toIndex within valid range', () => {
    const list = ['a', 'b', 'c']
    expect(reorderArray(list, 0, -5)).toEqual(['a', 'b', 'c'])
    expect(reorderArray(list, 0, 10)).toEqual(['b', 'c', 'a'])
  })

  it('handles arrays with undefined or null items correctly without dropping them', () => {
    const listWithUndefined = [undefined, 'a', 'b']
    expect(reorderArray(listWithUndefined, 0, 1)).toEqual(['a', undefined, 'b'])

    const listWithNull = ['x', null, 'z']
    expect(reorderArray(listWithNull, 1, 2)).toEqual(['x', 'z', null])
  })
})
