# Подсистема: Ui (L1)

> **Идентификатор:** `packages_ui`
> **Теги:** packages_ui, TypeScript / JavaScript (Node/Bun/Deno) | **Объем:** ~7086 токенов BPE

## 🎯 Назначение и роль
Подсистема `packages/ui` с ключевыми точками входа: packages/ui/package.json, packages/ui/src/index.ts

## 📁 Точки входа и структура файлов

| Файл | Строк | Статус |
| :--- | :--- | :--- |
| `packages/ui/package.json` | 38 | ⭐ Точка входа |
| `packages/ui/src/index.ts` | 13 | ⭐ Точка входа |
| `packages/ui/src/editor/split-editor-modal.ts` | 230 | Исходный код |
| `packages/ui/src/editor/editor-keymaps.ts` | 122 | Исходный код |
| `packages/ui/src/editor/editor-toolbar.ts` | 111 | Исходный код |
| `packages/ui/src/splitter/splitter-controller.ts` | 110 | Исходный код |
| `packages/ui/src/editor/code-editor.ts` | 99 | Исходный код |
| `packages/ui/src/editor/table-menu.ts` | 63 | Исходный код |
| `packages/ui/src/dnd/drop-zone.ts` | 62 | Исходный код |
| `packages/ui/src/editor/editor-theme.ts` | 39 | Исходный код |
| `packages/ui/src/preview/link-handler.ts` | 38 | Исходный код |
| `packages/ui/src/modal.ts` | 28 | Исходный код |
| `packages/ui/src/badge.ts` | 25 | Исходный код |
| `packages/ui/src/setting.ts` | 17 | Исходный код |
| `packages/ui/tsconfig.json` | 4 | Исходный код |

## 🔑 Ключевой контракт и экспорты
```text
export type SplitViewMode = 'source' | 'preview' | 'split' export interface SplitEditorModalOptions
export class SplitEditorModal extends Modal
export function createEditorKeymaps(tabSize: number, onSave?: () => void): readonly KeyBinding[]
export interface EditorToolbarOptions
export class EditorToolbar
```

## 🧪 Запуск и тестирование
```bash
rtk pnpm --filter ui test
```
