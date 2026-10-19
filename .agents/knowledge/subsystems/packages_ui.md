# Subsystem: Ui (L1)

> **Identifier:** `packages_ui`
> **Tags:** packages_ui, TypeScript / JavaScript (Node/Bun/Deno) | **Size:** ~7086 BPE tokens

## 🎯 Purpose and role
Subsystem `packages/ui` with key entry points: packages/ui/package.json, packages/ui/src/index.ts

## 📁 Entry points and file structure

| File | Lines | Status |
| :--- | :--- | :--- |
| `packages/ui/package.json` | 38 | ⭐ Entry point |
| `packages/ui/src/index.ts` | 13 | ⭐ Entry point |
| `packages/ui/src/editor/split-editor-modal.ts` | 230 | Source code |
| `packages/ui/src/editor/editor-keymaps.ts` | 122 | Source code |
| `packages/ui/src/editor/editor-toolbar.ts` | 111 | Source code |
| `packages/ui/src/splitter/splitter-controller.ts` | 110 | Source code |
| `packages/ui/src/editor/code-editor.ts` | 99 | Source code |
| `packages/ui/src/editor/table-menu.ts` | 63 | Source code |
| `packages/ui/src/dnd/drop-zone.ts` | 62 | Source code |
| `packages/ui/src/editor/editor-theme.ts` | 39 | Source code |
| `packages/ui/src/preview/link-handler.ts` | 38 | Source code |
| `packages/ui/src/modal.ts` | 28 | Source code |
| `packages/ui/src/badge.ts` | 25 | Source code |
| `packages/ui/src/setting.ts` | 17 | Source code |
| `packages/ui/tsconfig.json` | 4 | Source code |

## 🔑 Key contract and exports
```text
export type SplitViewMode = 'source' | 'preview' | 'split' export interface SplitEditorModalOptions
export class SplitEditorModal extends Modal
export function createEditorKeymaps(tabSize: number, onSave?: () => void): readonly KeyBinding[]
export interface EditorToolbarOptions
export class EditorToolbar
```

## 🧪 Running and testing
```bash
rtk pnpm --filter ui test
```
