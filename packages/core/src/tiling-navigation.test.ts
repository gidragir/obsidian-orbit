import { describe, expect, it } from 'vitest'
import { computeTreeLayoutRects, findAdjacentLeaf } from './tiling-geometry'
import {
  createDefaultTree,
  getAllLeaves,
  moveLeafToPosition,
  resizeLeafInDirection,
  swapLeavesById,
} from './tiling-tree'

describe('Hyprland Tiling Navigation & Resizing', () => {
  it('computes normalized layout rects for a 2-column tree', () => {
    const tree = createDefaultTree(2)
    const rects = computeTreeLayoutRects(tree)

    expect(rects.size).toBe(2)
    const leaf0 = rects.get('leaf-0')
    const leaf1 = rects.get('leaf-1')

    expect(leaf0).toBeDefined()
    expect(leaf1).toBeDefined()
    if (leaf0 && leaf1) {
      expect(leaf0.x).toBe(0)
      expect(leaf0.width).toBe(0.5)
      expect(leaf1.x).toBe(0.5)
      expect(leaf1.width).toBe(0.5)
    }
  })

  it('finds adjacent leaf to the right and left in 2-column layout', () => {
    const tree = createDefaultTree(2)

    const rightOf0 = findAdjacentLeaf(tree, 'leaf-0', 'right')
    expect(rightOf0).toBe('leaf-1')

    const leftOf1 = findAdjacentLeaf(tree, 'leaf-1', 'left')
    expect(leftOf1).toBe('leaf-0')

    const leftOf0 = findAdjacentLeaf(tree, 'leaf-0', 'left')
    expect(leftOf0).toBeNull()
  })

  it('finds adjacent leaf in master-stack layout (3 sections)', () => {
    // leaf-0 is on left (col 0), stack-branch is on right (col 1) with leaf-1 (top) and leaf-2 (bottom)
    const tree = createDefaultTree(3)

    const rightOfMaster = findAdjacentLeaf(tree, 'leaf-0', 'right')
    expect(rightOfMaster).toMatch(/leaf-1|leaf-2/)

    const downOfTopStack = findAdjacentLeaf(tree, 'leaf-1', 'down')
    expect(downOfTopStack).toBe('leaf-2')

    const upOfBottomStack = findAdjacentLeaf(tree, 'leaf-2', 'up')
    expect(upOfBottomStack).toBe('leaf-1')

    const leftOfStack = findAdjacentLeaf(tree, 'leaf-1', 'left')
    expect(leftOfStack).toBe('leaf-0')
  })

  it('swaps adjacent leaves when moving in direction', () => {
    const tree = createDefaultTree(2)
    const targetId = findAdjacentLeaf(tree, 'leaf-0', 'right')
    expect(targetId).toBe('leaf-1')

    if (targetId) {
      const swapped = swapLeavesById(tree, 'leaf-0', targetId)
      const leaves = getAllLeaves(swapped)
      expect(leaves[0]?.id).toBe('leaf-0')
      expect(leaves[0]?.sectionIndex).toBe(1)
      expect(leaves[1]?.sectionIndex).toBe(0)
    }
  })

  it('re-docks leaf to edge when moving to direction without direct neighbor', () => {
    const tree = createDefaultTree(2)
    // Moving leaf-1 to the right of leaf-0 actually creates column reorder
    const moved = moveLeafToPosition(tree, 'leaf-0', 'leaf-1', 'right')
    const rects = computeTreeLayoutRects(moved)
    const rect0 = rects.get('leaf-0')
    const rect1 = rects.get('leaf-1')
    if (rect0 && rect1) {
      expect(rect1.x).toBeLessThan(rect0.x)
    }
  })

  it('resizes leaf in column direction by expanding width', () => {
    const tree = createDefaultTree(2)
    const resized = resizeLeafInDirection(tree, 'leaf-0', 'right', 0.5)

    if (resized.type === 'branch') {
      const child0 = resized.children[0]
      const child1 = resized.children[1]
      expect(child0?.weight).toBe(1.5)
      expect(child1?.weight).toBe(1)
    }
  })

  it('resizes leaf in column direction by shrinking width', () => {
    const tree = createDefaultTree(2)
    const resized = resizeLeafInDirection(tree, 'leaf-0', 'left', 0.3)

    if (resized.type === 'branch') {
      const child0 = resized.children[0]
      expect(child0?.weight).toBeCloseTo(0.7)
    }
  })

  it('resizes stacked leaf in row direction', () => {
    const tree = createDefaultTree(3)
    const resized = resizeLeafInDirection(tree, 'leaf-1', 'down', 0.4)

    if (resized.type === 'branch') {
      const stackBranch = resized.children[1]
      if (stackBranch && stackBranch.type === 'branch') {
        const leaf1 = stackBranch.children[0]
        expect(leaf1?.weight).toBe(1.4)
      }
    }
  })

  it('correctly navigates up from panel 4 in column stack layout regardless of column width', () => {
    // Left column: leaf-2 (top), leaf-4 (bottom). Right column: leaf-3 (top), leaf-1 (bottom).
    const tree: import('./tiling-tree').TileNode = {
      type: 'branch',
      id: 'root-branch',
      direction: 'column',
      weight: 1,
      children: [
        {
          type: 'branch',
          id: 'left-col',
          direction: 'row',
          weight: 0.6, // left column narrow (0.375 of total)
          children: [
            { type: 'leaf', id: 'leaf-2', sectionIndex: 1, weight: 1 },
            { type: 'leaf', id: 'leaf-4', sectionIndex: 3, weight: 1 },
          ],
        },
        {
          type: 'branch',
          id: 'right-col',
          direction: 'row',
          weight: 1.0, // right column wide (0.625 of total)
          children: [
            { type: 'leaf', id: 'leaf-3', sectionIndex: 2, weight: 1 },
            { type: 'leaf', id: 'leaf-1', sectionIndex: 0, weight: 1 },
          ],
        },
      ],
    }

    // Moving up from leaf-4 must strictly target leaf-2, NEVER leaf-1 or leaf-3
    const targetAboveLeaf4 = findAdjacentLeaf(tree, 'leaf-4', 'up')
    expect(targetAboveLeaf4).toBe('leaf-2')

    // Moving right from leaf-4 targets leaf-1 (adjacent in right column)
    const targetRightLeaf4 = findAdjacentLeaf(tree, 'leaf-4', 'right')
    expect(targetRightLeaf4).toBe('leaf-1')

    // Moving up from leaf-1 targets leaf-3
    const targetAboveLeaf1 = findAdjacentLeaf(tree, 'leaf-1', 'up')
    expect(targetAboveLeaf1).toBe('leaf-3')
  })
})
