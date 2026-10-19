# Subsystem: ui (L1)

> **Identifier:** `ui`
> **Tags:** ui, editor | **Size:** ~5326 BPE tokens

## 🎯 Purpose and role
User interface for editing and interaction.

## 📁 Entry points and file structure

| File | Lines | Status |
| :--- | :--- | :--- |
| `packages/ui/package.json` | 39 | ⭐ Entry point |
| `packages/ui/src/index.ts` | 16 | ⭐ Entry point |
| `packages/ui/src/editor/split-editor-modal.ts` | 230 | Source code |
| `packages/ui/src/editor/editor-keymaps.ts` | 122 | Source code |
| `packages/ui/src/editor/editor-toolbar.ts` | 111 | Source code |
| `packages/ui/src/editor/code-editor.ts` | 87 | Source code |
| `packages/ui/src/editor/table-menu.ts` | 63 | Source code |
| `packages/ui/src/editor/editor-theme.ts` | 39 | Source code |
| `packages/ui/src/modal.ts` | 28 | Source code |
| `packages/ui/src/badge.ts` | 25 | Source code |
| `packages/ui/src/setting.ts` | 17 | Source code |
| `packages/ui/src/dnd/drop-zone.ts` | 20 | Source code |
| `packages/ui/src/preview/link-handler.ts` | 22 | Source code |
| `packages/ui/src/splitter/splitter-controller.ts` | 30 | Source code |
| `packages/ui/tsconfig.json` | 4 | Source code |

## 🔑 Key contract and exports
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

## 🧪 Running and testing
```bash
rtk pnpm --filter ui test
```
