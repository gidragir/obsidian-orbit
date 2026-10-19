# Subsystem: Core (L1)

> **Identifier:** `packages_core`
> **Tags:** packages_core, TypeScript / JavaScript (Node/Bun/Deno) | **Size:** ~12469 BPE tokens

## 🎯 Purpose and role
Subsystem `packages/core` with key entry points: packages/core/package.json, packages/core/src/index.ts

## 📁 Entry points and file structure

| File | Lines | Status |
| :--- | :--- | :--- |
| `packages/core/package.json` | 22 | ⭐ Entry point |
| `packages/core/src/index.ts` | 12 | ⭐ Entry point |
| `packages/core/src/tiling-tree.ts` | 452 | Source code |
| `packages/core/src/tiling-geometry.ts` | 191 | Source code |
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
| `packages/core/src/array.test.ts` | 49 | Source code |

## 🔑 Key contract and exports
```text
export type SplitDirection = 'row' | 'column' export interface TileLeafNode
export interface TileBranchNode
export type TileNode = TileLeafNode | TileBranchNode /** * Traverses tree to collect all leaf nodes in order. */ export function getAllLeaves(node: TileNode): ReadonlyArray<TileLeafNode>
export function createDefaultTree(sectionCount: number): TileNode
export function updateBranchWeights( node: TileNode, branchId: string, newWeights: ReadonlyArray<number> ): TileNode
export function swapLeavesById(node: TileNode, idA: string, idB: string): TileNode
export function splitLeaf( root: TileNode, targetLeafId: string, direction: SplitDirection, newSectionIndex: number, newLeafId: string, insertAfter = true ): TileNode
export interface RectBounds
export function clampRatio(ratio: number, minRatio = 0.15, maxRatio = 0.85): number
export function calculateHorizontalSplitRatio( pointerX: number, container: RectBounds, minRatio = 0.15, maxRatio = 0.85 ): number
```

## 🧪 Running and testing
```bash
rtk pnpm --filter core test
```
