# Subsystem: Snippet Renderer (L1)

> **Identifier:** `plugins_snippet-renderer`
> **Tags:** plugins_snippet-renderer, TypeScript / JavaScript (Node/Bun/Deno) | **Size:** ~113361 BPE tokens

## 🎯 Purpose and role
Subsystem `plugins/snippet-renderer` with key entry points: plugins/snippet-renderer/package.json, plugins/snippet-renderer/src/main.ts

## 📁 Entry points and file structure

| File | Lines | Status |
| :--- | :--- | :--- |
| `plugins/snippet-renderer/package.json` | 31 | ⭐ Entry point |
| `plugins/snippet-renderer/src/main.ts` | 19 | ⭐ Entry point |
| `plugins/snippet-renderer/src/ui/snippet-render-child.ts` | 231 | Source code |
| `plugins/snippet-renderer/src/utils/parser.test.ts` | 112 | Source code |
| `plugins/snippet-renderer/src/utils/parser.ts` | 74 | Source code |
| `plugins/snippet-renderer/README.md` | 44 | Source code |
| `plugins/snippet-renderer/main.js` | 38 | Source code |
| `plugins/snippet-renderer/src/utils/fence.test.ts` | 15 | Source code |
| `plugins/snippet-renderer/tsconfig.json` | 10 | Source code |
| `plugins/snippet-renderer/CHANGELOG.md` | 10 | Source code |
| `plugins/snippet-renderer/manifest.json` | 9 | Source code |
| `plugins/snippet-renderer/src/utils/fence.ts` | 7 | Source code |
| `plugins/snippet-renderer/versions.json` | 3 | Source code |

## 🔑 Key contract and exports
```text
export class SnippetRenderChild extends MarkdownRenderChild
export interface ParsedTemplate
export function parseLanguageAndSource(source: string, fenceHeader?: string): ParsedTemplate
export function extractVariables(source: string): readonly string[]
export function substituteVariables( source: string, values: Readonly<Record<string, string>> ): string
```

## 🧪 Running and testing
```bash
rtk pnpm --filter snippet-renderer test
```
