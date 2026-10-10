import { describe, expect, it } from 'vitest'
import {
  createDefaultTree,
  getAllLeaves,
  moveLeafToPosition,
  reconcileTreeWithSections,
  reindexTreeLeaves,
  removeLeaf,
  splitLeaf,
  swapLeavesById,
  updateBranchWeights,
} from './tiling-tree'

describe('tiling-tree', () => {
  it('creates single leaf for 1 section', () => {
    const tree = createDefaultTree(1)
    expect(tree.type).toBe('leaf')
    if (tree.type === 'leaf') {
      expect(tree.sectionIndex).toBe(0)
    }
  })

  it('creates column branch for 2 sections', () => {
    const tree = createDefaultTree(2)
    expect(tree.type).toBe('branch')
    if (tree.type === 'branch') {
      expect(tree.direction).toBe('column')
      expect(tree.children).toHaveLength(2)
    }
  })

  it('gathers all leaves correctly from nested tree', () => {
    const tree = createDefaultTree(4)
    const leaves = getAllLeaves(tree)
    expect(leaves).toHaveLength(4)
    expect(leaves.map((l) => l.sectionIndex)).toEqual([0, 1, 2, 3])
  })

  it('updates branch weights correctly', () => {
    const tree = createDefaultTree(2)
    const updated = updateBranchWeights(tree, 'root-branch', [2, 3])
    if (updated.type === 'branch') {
      expect(updated.children[0]?.weight).toBe(2)
      expect(updated.children[1]?.weight).toBe(3)
    }
  })

  it('swaps leaves by IDs without modifying structure', () => {
    const tree = createDefaultTree(3)
    const swapped = swapLeavesById(tree, 'leaf-0', 'leaf-1')
    const leaves = getAllLeaves(swapped)
    expect(leaves[0]?.sectionIndex).toBe(1)
    expect(leaves[1]?.sectionIndex).toBe(0)
  })

  it('splits leaf into column or row branch', () => {
    const tree = createDefaultTree(1)
    const split = splitLeaf(tree, 'leaf-0', 'row', 1, 'leaf-new', true)

    expect(split.type).toBe('branch')
    if (split.type === 'branch') {
      expect(split.direction).toBe('row')
      expect(split.children).toHaveLength(2)
      expect(split.children[0]?.type).toBe('leaf')
      expect(split.children[1]?.type).toBe('leaf')
    }
  })

  it('removes leaf and collapses single-child branch', () => {
    const tree = createDefaultTree(2)
    const pruned = removeLeaf(tree, 'leaf-1')

    expect(pruned).not.toBeNull()
    expect(pruned?.type).toBe('leaf')
    if (pruned?.type === 'leaf') {
      expect(pruned.id).toBe('leaf-0')
    }
  })

  it('moves leaf to right position creating column branch', () => {
    const tree = createDefaultTree(2)
    const moved = moveLeafToPosition(tree, 'leaf-1', 'leaf-0', 'right')
    const leaves = getAllLeaves(moved)
    expect(leaves).toHaveLength(2)
  })

  it('moves leaf to bottom creating row branch', () => {
    const tree = createDefaultTree(2)
    const moved = moveLeafToPosition(tree, 'leaf-1', 'leaf-0', 'bottom')
    expect(moved.type).toBe('branch')
    if (moved.type === 'branch') {
      expect(moved.direction).toBe('row')
    }
  })

  it('re-indexes tree leaves sequentially starting from 0', () => {
    const tree = createDefaultTree(3)
    const swapped = swapLeavesById(tree, 'leaf-0', 'leaf-2')
    const reindexed = reindexTreeLeaves(swapped)
    const leaves = getAllLeaves(reindexed)
    expect(leaves.map((l) => l.sectionIndex)).toEqual([0, 1, 2])
  })

  it('reconciles tree by adding new leaves when sections count increases', () => {
    // Initially 2 sections (leaves 0 and 1)
    const tree = createDefaultTree(2)
    // Section count increased to 4 (e.g. 2 new separators added)
    const reconciled = reconcileTreeWithSections(tree, 4)
    const leaves = getAllLeaves(reconciled)

    expect(leaves).toHaveLength(4)
    expect(leaves.map((l) => l.sectionIndex)).toEqual([0, 1, 2, 3])
  })

  it('reconciles tree by pruning leaves when sections count decreases', () => {
    const tree = createDefaultTree(4)
    const reconciled = reconcileTreeWithSections(tree, 2)
    const leaves = getAllLeaves(reconciled)

    expect(leaves).toHaveLength(2)
    expect(leaves.map((l) => l.sectionIndex)).toEqual([0, 1])
  })

  it('returns default tree if root is null or undefined', () => {
    const tree = reconcileTreeWithSections(null, 3)
    const leaves = getAllLeaves(tree)
    expect(leaves).toHaveLength(3)
  })
})
