# Subsystem: Tabs Renderer (L1)

> **Identifier:** `plugins_tabs-renderer`
> **Tags:** plugins_tabs-renderer, TypeScript / JavaScript (Node/Bun/Deno) | **Size:** ~10104 BPE tokens

## 🎯 Purpose and role
Subsystem `plugins/tabs-renderer` with key entry points: plugins/tabs-renderer/src/main.ts, plugins/tabs-renderer/package.json

## 📁 Entry points and file structure

| File | Lines | Status |
| :--- | :--- | :--- |
| `plugins/tabs-renderer/src/main.ts` | 70 | ⭐ Entry point |
| `plugins/tabs-renderer/package.json` | 37 | ⭐ Entry point |
| `plugins/tabs-renderer/src/ui/settings/tabs-setting-tab.ts` | 306 | Source code |
| `plugins/tabs-renderer/src/ui/tabs-view.ts` | 213 | Source code |
| `plugins/tabs-renderer/src/ui/editor/toolbar.ts` | 97 | Source code |
| `plugins/tabs-renderer/src/utils/tabs-parser.ts` | 96 | Source code |
| `plugins/tabs-renderer/src/utils/tabs-parser.test.ts` | 88 | Source code |
| `plugins/tabs-renderer/src/ui/editor/tab-editor.ts` | 82 | Source code |
| `plugins/tabs-renderer/src/ui/dnd-controller.ts` | 75 | Source code |
| `plugins/tabs-renderer/src/ui/editor/keymaps.ts` | 74 | Source code |
| `plugins/tabs-renderer/src/ui/editor/table-menu.ts` | 63 | Source code |
| `plugins/tabs-renderer/src/utils/tabs-serializer.test.ts` | 58 | Source code |
| `plugins/tabs-renderer/src/settings/settings.ts` | 53 | Source code |
| `plugins/tabs-renderer/src/services/editor-service.ts` | 46 | Source code |
| `plugins/tabs-renderer/src/utils/config-parser.test.ts` | 45 | Source code |

## 🔑 Key contract and exports
```text
export interface ITabsPluginHost extends Plugin
export class TabsSettingsTab extends PluginSettingTab
export class TabsView extends MarkdownRenderChild
export class EditorToolbar
```

## 🧪 Running and testing
```bash
rtk pnpm --filter tabs-renderer test
```
