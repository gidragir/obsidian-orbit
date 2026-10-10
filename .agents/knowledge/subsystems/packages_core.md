# Подсистема: Core (L1)

> **Идентификатор:** `packages_core`
> **Теги:** packages_core, TypeScript / JavaScript (Node/Bun/Deno) | **Объем:** ~12469 токенов BPE

## 🎯 Назначение и роль
Подсистема `packages/core` с ключевыми точками входа: packages/core/package.json, packages/core/src/index.ts

## 📁 Точки входа и структура файлов

| Файл | Строк | Статус |
| :--- | :--- | :--- |
| `packages/core/package.json` | 22 | ⭐ Точка входа |
| `packages/core/src/index.ts` | 12 | ⭐ Точка входа |
| `packages/core/src/tiling-tree.ts` | 452 | Исходный код |
| `packages/core/src/tiling-geometry.ts` | 191 | Исходный код |
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
| `packages/core/src/array.test.ts` | 49 | Исходный код |

## 🔑 Ключевой контракт и экспорты
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

## 🧪 Запуск и тестирование
```bash
rtk pnpm --filter core test
```
