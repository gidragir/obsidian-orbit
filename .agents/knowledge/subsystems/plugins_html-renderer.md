# Subsystem: Html Renderer (L1)

> **Identifier:** `plugins_html-renderer`
> **Tags:** plugins_html-renderer, TypeScript / JavaScript (Node/Bun/Deno) | **Size:** ~117754 BPE tokens

## 🎯 Purpose and role
Subsystem `plugins/html-renderer` with key entry points: plugins/html-renderer/src/main.ts, plugins/html-renderer/package.json

## 📁 Entry points and file structure

| File | Lines | Status |
| :--- | :--- | :--- |
| `plugins/html-renderer/src/main.ts` | 48 | ⭐ Entry point |
| `plugins/html-renderer/package.json` | 32 | ⭐ Entry point |
| `plugins/html-renderer/src/ui/html-render-child.ts` | 209 | Source code |
| `plugins/html-renderer/src/settings/settings-tab.ts` | 190 | Source code |
| `plugins/html-renderer/src/utils/document-builder.ts` | 123 | Source code |
| `plugins/html-renderer/main.js` | 91 | Source code |
| `plugins/html-renderer/README.md` | 62 | Source code |
| `plugins/html-renderer/src/utils/document-builder.test.ts` | 57 | Source code |
| `plugins/html-renderer/src/utils/source-parser.test.ts` | 37 | Source code |
| `plugins/html-renderer/src/utils/sandbox.test.ts` | 34 | Source code |
| `plugins/html-renderer/src/utils/source-parser.ts` | 20 | Source code |
| `plugins/html-renderer/CHANGELOG.md` | 20 | Source code |
| `plugins/html-renderer/src/settings/settings.ts` | 19 | Source code |
| `plugins/html-renderer/src/services/theme-service.ts` | 18 | Source code |
| `plugins/html-renderer/src/services/content-loader.ts` | 17 | Source code |

## 🔑 Key contract and exports
```text
export class HTMLRenderChild extends MarkdownRenderChild
export class HTMLRendererSettingTab extends PluginSettingTab
export interface ThemeTokens
export class HTMLDocumentBuilder
```

## 🧪 Running and testing
```bash
rtk pnpm --filter html-renderer test
```
