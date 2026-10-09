import { describe, expect, it } from 'vitest'
import {
  calculateHorizontalSplitRatio,
  calculateVerticalSplitRatio,
  clampRatio,
} from './tiling-geometry'

describe('tiling-geometry', () => {
  it('clamps ratio properly', () => {
    expect(clampRatio(0.05, 0.2, 0.8)).toBe(0.2)
    expect(clampRatio(0.95, 0.2, 0.8)).toBe(0.8)
    expect(clampRatio(0.5, 0.2, 0.8)).toBe(0.5)
  })

  it('calculates horizontal split ratio correctly', () => {
    const container = { left: 100, top: 0, width: 1000, height: 600 }
    const ratio = calculateHorizontalSplitRatio(600, container, 0.2, 0.8)

    // (600 - 100) / 1000 = 0.5
    expect(ratio).toBe(0.5)
  })

  it('clamps horizontal split ratio when pointer is outside bounds', () => {
    const container = { left: 100, top: 0, width: 1000, height: 600 }
    const minRatio = calculateHorizontalSplitRatio(50, container, 0.2, 0.8)
    const maxRatio = calculateHorizontalSplitRatio(1050, container, 0.2, 0.8)

    expect(minRatio).toBe(0.2)
    expect(maxRatio).toBe(0.8)
  })

  it('calculates vertical split ratio correctly', () => {
    const container = { left: 0, top: 200, width: 400, height: 800 }
    const ratio = calculateVerticalSplitRatio(600, container, 0.1, 0.9)

    // (600 - 200) / 800 = 0.5
    expect(ratio).toBe(0.5)
  })

  it('safely handles zero-dimension containers', () => {
    const container = { left: 0, top: 0, width: 0, height: 0 }
    expect(calculateHorizontalSplitRatio(100, container)).toBe(0.5)
    expect(calculateVerticalSplitRatio(100, container)).toBe(0.5)
  })
})
