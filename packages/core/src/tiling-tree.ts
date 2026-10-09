/**
 * Pure domain model and operations for arbitrary recursive tiling trees.
 * 0% dependencies on Obsidian API, DOM, or Node.js runtime.
 */

export type SplitDirection = 'row' | 'column'

export interface TileLeafNode {
  readonly type: 'leaf'
  readonly id: string
  readonly sectionIndex: number
  readonly weight: number
}

export interface TileBranchNode {
  readonly type: 'branch'
  readonly id: string
  readonly direction: SplitDirection
  readonly children: ReadonlyArray<TileNode>
  readonly weight: number
}

export type TileNode = TileLeafNode | TileBranchNode

/**
 * Traverses tree to collect all leaf nodes in order.
 */
export function getAllLeaves(node: TileNode): ReadonlyArray<TileLeafNode> {
  if (node.type === 'leaf') {
    return [node]
  }
  const leaves: TileLeafNode[] = []
  for (const child of node.children) {
    leaves.push(...getAllLeaves(child))
  }
  return leaves
}

/**
 * Creates a default tiling tree for N sections.
 * 1 section: single leaf
 * 2 sections: 1 row with 2 columns
 * >2 sections: column 0 (master) and column 1 (vertical stack row of remaining sections)
 */
export function createDefaultTree(sectionCount: number): TileNode {
  if (sectionCount <= 1) {
    return {
      type: 'leaf',
      id: 'leaf-0',
      sectionIndex: 0,
      weight: 1,
    }
  }

  if (sectionCount === 2) {
    return {
      type: 'branch',
      id: 'root-branch',
      direction: 'column',
      weight: 1,
      children: [
        { type: 'leaf', id: 'leaf-0', sectionIndex: 0, weight: 1 },
        { type: 'leaf', id: 'leaf-1', sectionIndex: 1, weight: 1 },
      ],
    }
  }

  const stackChildren: TileNode[] = []
  for (let i = 1; i < sectionCount; i++) {
    stackChildren.push({
      type: 'leaf',
      id: `leaf-${i}`,
      sectionIndex: i,
      weight: 1,
    })
  }

  return {
    type: 'branch',
    id: 'root-branch',
    direction: 'column',
    weight: 1,
    children: [
      { type: 'leaf', id: 'leaf-0', sectionIndex: 0, weight: 1.5 },
      {
        type: 'branch',
        id: 'stack-branch',
        direction: 'row',
        weight: 1,
        children: stackChildren,
      },
    ],
  }
}

/**
 * Updates weights of direct children in a branch identified by branchId.
 */
export function updateBranchWeights(
  node: TileNode,
  branchId: string,
  newWeights: ReadonlyArray<number>
): TileNode {
  if (node.type === 'leaf') {
    return node
  }

  if (node.id === branchId) {
    const updatedChildren = node.children.map((child, idx) => {
      const weight = newWeights[idx] ?? child.weight
      return { ...child, weight }
    })
    return {
      ...node,
      children: updatedChildren,
    }
  }

  return {
    ...node,
    children: node.children.map((child) => updateBranchWeights(child, branchId, newWeights)),
  }
}

/**
 * Swaps section indices of two leaves by their leaf IDs.
 */
export function swapLeavesById(node: TileNode, idA: string, idB: string): TileNode {
  const leaves = getAllLeaves(node)
  const leafA = leaves.find((l) => l.id === idA)
  const leafB = leaves.find((l) => l.id === idB)

  if (!leafA || !leafB || idA === idB) {
    return node
  }

  const indexA = leafA.sectionIndex
  const indexB = leafB.sectionIndex

  function replaceSectionIndex(curr: TileNode): TileNode {
    if (curr.type === 'leaf') {
      if (curr.id === idA) return { ...curr, sectionIndex: indexB }
      if (curr.id === idB) return { ...curr, sectionIndex: indexA }
      return curr
    }
    return {
      ...curr,
      children: curr.children.map(replaceSectionIndex),
    }
  }

  return replaceSectionIndex(node)
}

/**
 * Splits a target leaf into two panels along the given direction.
 */
export function splitLeaf(
  root: TileNode,
  targetLeafId: string,
  direction: SplitDirection,
  newSectionIndex: number,
  newLeafId: string,
  insertAfter = true
): TileNode {
  function transform(node: TileNode): TileNode {
    if (node.type === 'leaf') {
      if (node.id !== targetLeafId) {
        return node
      }

      const existingLeaf: TileLeafNode = {
        ...node,
        weight: 1,
      }
      const createdLeaf: TileLeafNode = {
        type: 'leaf',
        id: newLeafId,
        sectionIndex: newSectionIndex,
        weight: 1,
      }

      const children = insertAfter ? [existingLeaf, createdLeaf] : [createdLeaf, existingLeaf]

      return {
        type: 'branch',
        id: `branch-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        direction,
        weight: node.weight,
        children,
      }
    }

    return {
      ...node,
      children: node.children.map(transform),
    }
  }

  return transform(root)
}

function pruneBranchChildren(branch: TileBranchNode, leafId: string): TileNode | null {
  const children: TileNode[] = []
  for (const child of branch.children) {
    const pruned = removeLeaf(child, leafId)
    if (pruned) {
      children.push(pruned)
    }
  }

  if (children.length === 0) {
    return null
  }
  if (children.length === 1) {
    const single = children[0]
    return single ? { ...single, weight: branch.weight } : null
  }
  return { ...branch, children }
}

/**
 * Removes a leaf node from the tree and prunes single-child or empty branches.
 */
export function removeLeaf(root: TileNode, leafId: string): TileNode | null {
  if (root.type === 'leaf') {
    return root.id === leafId ? null : root
  }
  return pruneBranchChildren(root, leafId)
}

export type DropZonePosition = 'top' | 'bottom' | 'left' | 'right' | 'center'

export function findLeafById(root: TileNode, leafId: string): TileLeafNode | null {
  if (root.type === 'leaf') {
    return root.id === leafId ? root : null
  }
  for (const child of root.children) {
    const found = findLeafById(child, leafId)
    if (found) return found
  }
  return null
}

function insertRelativeToNode(
  root: TileNode,
  targetId: string,
  sourceLeaf: TileLeafNode,
  direction: SplitDirection,
  isBefore: boolean
): TileNode {
  if (root.type === 'leaf') {
    if (root.id !== targetId) return root
    const children = isBefore ? [sourceLeaf, root] : [root, sourceLeaf]
    return {
      type: 'branch',
      id: `branch-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      direction,
      weight: root.weight,
      children,
    }
  }

  const targetIdx = root.children.findIndex((c) => c.id === targetId)
  if (targetIdx !== -1 && root.direction === direction) {
    const updated = [...root.children]
    const insertAt = isBefore ? targetIdx : targetIdx + 1
    updated.splice(insertAt, 0, { ...sourceLeaf, weight: 1 })
    return { ...root, children: updated }
  }

  return {
    ...root,
    children: root.children.map((child) =>
      insertRelativeToNode(child, targetId, sourceLeaf, direction, isBefore)
    ),
  }
}

export function moveLeafToPosition(
  root: TileNode,
  sourceLeafId: string,
  targetLeafId: string,
  position: DropZonePosition
): TileNode {
  if (sourceLeafId === targetLeafId) {
    return root
  }

  if (position === 'center') {
    return swapLeavesById(root, sourceLeafId, targetLeafId)
  }

  const sourceLeaf = findLeafById(root, sourceLeafId)
  if (!sourceLeaf) {
    return root
  }

  const treeWithoutSource = removeLeaf(root, sourceLeafId)
  if (!treeWithoutSource) {
    return root
  }

  const direction: SplitDirection = position === 'left' || position === 'right' ? 'column' : 'row'
  const isBefore = position === 'left' || position === 'top'

  return insertRelativeToNode(
    treeWithoutSource,
    targetLeafId,
    { ...sourceLeaf, weight: 1 },
    direction,
    isBefore
  )
}
