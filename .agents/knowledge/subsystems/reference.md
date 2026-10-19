# Subsystem: reference (L1)

> **Identifier:** `reference`
> **Tags:** reference, examples | **Size:** ~332778 BPE tokens

## 🎯 Purpose and role
Reference information and plugin usage examples.

## 📁 Entry points and file structure

| File | Lines | Status |
| :--- | :--- | :--- |
| `reference/obsidian-tabs/src/main.ts` | 156 | ⭐ Entry point |
| `reference/snippet-templater/src/main.ts` | 37 | ⭐ Entry point |
| `reference/html-renderer/src/main.ts` | 35 | ⭐ Entry point |
| `reference/snippet-templater/package.json` | 30 | ⭐ Entry point |
| `reference/html-renderer/package.json` | 30 | ⭐ Entry point |
| `reference/obsidian-tabs/package.json` | 30 | ⭐ Entry point |
| `reference/obsidian-tabs/docs/.vitepress/theme/index.ts` | 17 | ⭐ Entry point |
| `reference/obsidian-tabs-context.md` | 7759 | Source code |
| `reference/snippet-templater/pnpm-lock.yaml` | 5012 | Source code |
| `reference/html-renderer/pnpm-lock.yaml` | 5012 | Source code |
| `reference/obsidian-tabs/package-lock.json` | 2870 | Source code |
| `reference/html-renderer-context.md` | 1379 | Source code |
| `reference/snippet-templater-context.md` | 1315 | Source code |
| `reference/obsidian-tabs/src/components/editor/tab-editor.ts` | 859 | Source code |
| `reference/obsidian-tabs/src/settings.ts` | 561 | Source code |

## 🔑 Key contract and exports
```text
export class TabEditor
export interface TabsSettings
export const DEFAULT_SETTINGS: TabsSettings =
export class TabsSettingsTab extends PluginSettingTab
```

## 🧪 Running and testing
```bash
rtk pnpm test
```
