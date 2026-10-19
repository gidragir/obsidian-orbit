# Subsystem: core (L1)

> **Identifier:** `core`
> **Tags:** core, geometry | **Size:** ~12450 BPE tokens

## 🎯 Purpose and role
The system core, including tile structure and geometry.

## 📁 Entry points and file structure

| File | Lines | Status |
| :--- | :--- | :--- |
| `packages/core/package.json` | 22 | ⭐ Entry point |
| `packages/core/src/index.ts` | 13 | ⭐ Entry point |
| `packages/core/src/array.ts` | 0 | ⭐ New file |
| `packages/core/src/tiling-tree.ts` | 653 | Source code |
| `packages/core/src/tiling-geometry.ts` | 441 | Source code |
| `packages/core/src/tiling-navigation.test.ts` | 164 | Source code |
| `packages/core/src/tiling-tree.test.ts` | 129 | Source code |
| `packages/core/src/markdown.ts` | 110 | Source code |
| `packages/core/src/markdown.test.ts` | 101 | Source code |
| `packages/core/src/path.ts` | 89 | Source code |
| `packages/core/src/path.test.ts` | 84 | Source code |
| `packages/core/src/settings.test.ts` | 81 | Source code |
| `packages/core/src/tiling-splitter.test.ts` | 77 | Source code |
| `packages/core/src/tiling-splitter.ts` | 68 | Source code |
| `packages/core/src/settings.ts` | 56 | Source code |
| `packages/core/src/tiling-geometry.test.ts` | 45 | Source code |

## 🔑 Key contract and exports
```text
export type SplitDirection = 'row' | 'column'
export interface TileLeafNode
export interface TileBranchNode
export type TileNode = TileLeafNode | TileBranchNode

/** * Traverses tree to collect all leaf nodes in order. */
export function getAllLeaves(node: TileNode): ReadonlyArray<TileLeafNode>
export function createDefaultTree(sectionCount: number): TileNode
export function updateBranchWeights(
  node: TileNode,
  branchId: string,
  newWeights: ReadonlyArray<number>
): TileNode
export function swapLeavesById(node: TileNode, idA: string, idB: string): TileNode
export function splitLeaf(
  root: TileNode,
  targetLeafId: string,
  direction: SplitDirection,
  newSectionIndex: number,
  newLeafId: string,
  insertAfter = true
): TileNode
export function removeLeaf(root: TileNode, leafId: string): TileNode | null
export type DropZonePosition = 'top' | 'bottom' | 'left' | 'right' | 'center'
export function findLeafById(root: TileNode, leafId: string): TileLeafNode | null
export function moveLeafToPosition(
  root: TileNode,
  sourceLeafId: string,
  targetLeafId: string,
  position: DropZonePosition
): TileNode
export function reindexTreeLeaves(root: TileNode): TileNode
export function reconcileTreeWithSections(
  root: TileNode | null | undefined,
  sectionCount: number
): TileNode
export function findParentBranch(
  root: TileNode,
  targetId: string
): { branch: TileBranchNode; index: number } | null
export function resizeLeafInDirection(
  root: TileNode,
  leafId: string,
  direction: 'left' | 'right' | 'up' | 'down',
  delta = 0.1
): TileNode
export type Direction = 'left' | 'right' | 'up' | 'down'
export interface RectBounds
export function clampRatio(ratio: number, minRatio = 0.15, maxRatio = 0.85): number
export function calculateHorizontalSplitRatio(
  pointerX: number,
  container: RectBounds,
  minRatio = 0.15,
  maxRatio = 0.85
): number
export function calculateVerticalSplitRatio(
  pointerY: number,
  container: RectBounds,
  minRatio = 0.15,
  maxRatio = 0.85
): number
export interface LeafNormalizedRect
export function computeTreeLayoutRects(root: TileNode): ReadonlyMap<string, LeafNormalizedRect>
export function findAdjacentLeaf(
  root: TileNode,
  currentLeafId: string,
  direction: Direction
): string | null
export interface ParsedFrontmatter
export interface MarkdownBlock
export function parseFrontmatter(content: string): ParsedFrontmatter
export function extractFrontmatter(content: string): Record<string, string>
export function stripFrontmatter(content: string): string
export function extractCodeBlocks(content: string): ReadonlyArray<MarkdownBlock>
export function findMarkdownBlocks(
  content: string,
  blockType?: string
): ReadonlyArray<MarkdownBlock>
export function normalizePath(rawPath: string): string
export function joinPaths(...segments: ReadonlyArray<string>): string
```

## 🧪 Running and testing
```bash
rtk pnpm --filter core test
```
