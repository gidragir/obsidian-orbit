# Подсистема: ui (L1)

> **Идентификатор:** `ui`
> **Теги:** ui, editor | **Объем:** ~5326 токенов BPE

## 🎯 Назначение и роль
Интерфейс пользователя для редактирования и взаимодействия.

## 📁 Точки входа и структура файлов

| Файл | Строк | Статус |
| :--- | :--- | :--- |
| `packages/ui/package.json` | 39 | ⭐ Точка входа |
| `packages/ui/src/index.ts` | 16 | ⭐ Точка входа |
| `packages/ui/src/editor/split-editor-modal.ts` | 230 | Исходный код |
| `packages/ui/src/editor/editor-keymaps.ts` | 122 | Исходный код |
| `packages/ui/src/editor/editor-toolbar.ts` | 111 | Исходный код |
| `packages/ui/src/editor/code-editor.ts` | 87 | Исходный код |
| `packages/ui/src/editor/table-menu.ts` | 63 | Исходный код |
| `packages/ui/src/editor/editor-theme.ts` | 39 | Исходный код |
| `packages/ui/src/modal.ts` | 28 | Исходный код |
| `packages/ui/src/badge.ts` | 25 | Исходный код |
| `packages/ui/src/setting.ts` | 17 | Исходный код |
| `packages/ui/src/dnd/drop-zone.ts` | 20 | Исходный код |
| `packages/ui/src/preview/link-handler.ts` | 22 | Исходный код |
| `packages/ui/src/splitter/splitter-controller.ts` | 30 | Исходный код |
| `packages/ui/tsconfig.json` | 4 | Исходный код |

## 🔑 Ключевой контракт и экспорты
```text
export type SplitViewMode = 'source' | 'preview' | 'split' export interface SplitEditorModalOptions
export class SplitEditorModal extends Modal
export function createEditorKeymaps(tabSize: number, onSave?: () => void): readonly KeyBinding[]
export interface EditorToolbarOptions
export class EditorToolbar
export interface CodeEditorOptions
export class CodeEditor
export function generateMarkdownTable(rows: number, cols: number): string
export class TableMenu extends Menu
export const baseTheme: Extension = EditorView.baseTheme(
export const baseHighlight: Extension = syntaxHighlighting( HighlightStyle.define([
export abstract class BaseModal extends Modal
export const BadgeVariant =
export type BadgeVariantType = (typeof BadgeVariant)[keyof typeof BadgeVariant] export interface BadgeOptions
export function getBadgeClassNames(variant: BadgeVariantType = BadgeVariant.Default): string
export interface SettingOptions
export function createSetting(containerEl: HTMLElement, options: SettingOptions): Setting
export class DropZone
export class LinkHandler
export class SplitterController
```

## 🧪 Запуск и тестирование
```bash
rtk pnpm --filter ui test
```
