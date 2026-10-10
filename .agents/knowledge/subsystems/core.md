# Подсистема: core (L1)

> **Идентификатор:** `core`
> **Теги:** core, geometry | **Объем:** ~12450 токенов BPE

## 🎯 Назначение и роль
Ядро системы, включающее структуру и геометрию тайлов.

## 📁 Точки входа и структура файлов

| Файл | Строк | Статус |
| :--- | :--- | :--- |
| `packages/core/package.json` | 22 | ⭐ Точка входа |
| `packages/core/src/index.ts` | 13 | ⭐ Точка входа |
| `packages/core/src/array.ts` | 0 | ⭐ Новый файл |
| `packages/core/src/tiling-tree.ts` | 653 | Исходный код |
| `packages/core/src/tiling-geometry.ts` | 441 | Исходный код |
| `packages/core/src/tiling-navigation.test.ts` | 164 | Исходный код |
| `packages/core/src/tiling-tree.test.ts` | 129 | Исходный код |
| `packages/core/src/markdown.ts` | 110 | Исходный код |
| `packages/core/src/markdown.test.ts` | 101 | Исходный код |
| `packages/core/src/path.ts` | 89 | Исходный код |
| `packages/core/src/path.test.ts` | 84 | Исходный код |
| `packages/core/src/settings.test.ts` | 81 | Исходный код |
| `packages/core/src/tiling-splitter.test.ts` | 77 | Исходный код |
| `packages/core/src/tiling-splitter.ts` | 68 | Исходный код |
| `packages/core/src/settings.ts` | 56 | Исходный код |
| `packages/core/src/tiling-geometry.test.ts` | 45 | Исходный код |

## 🔑 Ключевой контракт и экспорты
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

## 🧪 Запуск и тестирование
```bash
rtk pnpm --filter core test
```
