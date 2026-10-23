import { describe, expect, it } from 'vitest'
import { computeInsertIndex, computeSortZone, remapIndexAfterMove } from './list-drop'

describe('computeSortZone', () => {
  it('lands after the target when moving forward', () => {
    expect(computeSortZone(0, 2)).toBe('after')
  })

  it('lands before the target when moving backward', () => {
    expect(computeSortZone(3, 1)).toBe('before')
  })

  it('puts the dragged item exactly on the target index', () => {
    expect(computeInsertIndex(2, 1, computeSortZone(2, 1))).toBe(1)
    expect(computeInsertIndex(0, 1, computeSortZone(0, 1))).toBe(1)
  })
})

describe('computeInsertIndex', () => {
  it('moves forward', () => {
    expect(computeInsertIndex(0, 2, 'after')).toBe(2)
    expect(computeInsertIndex(0, 2, 'before')).toBe(1)
  })

  it('moves backward', () => {
    expect(computeInsertIndex(3, 1, 'before')).toBe(1)
    expect(computeInsertIndex(3, 1, 'after')).toBe(2)
  })

  it('keeps the position when dropped next to itself', () => {
    expect(computeInsertIndex(1, 2, 'before')).toBe(1)
    expect(computeInsertIndex(2, 1, 'after')).toBe(2)
  })
})

describe('remapIndexAfterMove', () => {
  it('follows the moved item', () => {
    expect(remapIndexAfterMove(1, 1, 3)).toBe(3)
  })

  it('shifts items between the positions', () => {
    expect(remapIndexAfterMove(2, 0, 3)).toBe(1)
    expect(remapIndexAfterMove(1, 3, 0)).toBe(2)
  })

  it('keeps items outside the moved range', () => {
    expect(remapIndexAfterMove(0, 1, 3)).toBe(0)
    expect(remapIndexAfterMove(4, 1, 3)).toBe(4)
  })
})
