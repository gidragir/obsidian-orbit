# Subsystem: Adapters (L1)

> **Identifier:** `packages_adapters`
> **Tags:** packages_adapters, TypeScript / JavaScript (Node/Bun/Deno) | **Size:** ~3137 BPE tokens

## 🎯 Purpose and role
Subsystem `packages/adapters` with key entry points: packages/adapters/package.json, packages/adapters/src/index.ts

## 📁 Entry points and file structure

| File | Lines | Status |
| :--- | :--- | :--- |
| `packages/adapters/package.json` | 30 | ⭐ Entry point |
| `packages/adapters/src/index.ts` | 12 | ⭐ Entry point |
| `packages/adapters/src/editor.ts` | 108 | Source code |
| `packages/adapters/src/vault.ts` | 97 | Source code |
| `packages/adapters/src/debounced-file-sync.ts` | 79 | Source code |
| `packages/adapters/src/settings.ts` | 38 | Source code |
| `packages/adapters/src/command.ts` | 35 | Source code |
| `packages/adapters/src/declarative-setting-tab.ts` | 32 | Source code |
| `packages/adapters/src/clipboard.ts` | 20 | Source code |
| `packages/adapters/src/notice.ts` | 8 | Source code |
| `packages/adapters/tsconfig.json` | 4 | Source code |

## 🔑 Key contract and exports
```text
export function replaceCodeBlock( editor: Editor, sectionInfo: MarkdownSectionInformation, newBlockContent: string, expectedFencePrefix?: string ): boolean
export class ObsidianVaultAdapter implements IVaultPort
export interface DebouncedWorkspaceFileAdapterOptions
export class DebouncedWorkspaceFileAdapter
```

## 🧪 Running and testing
```bash
rtk pnpm --filter adapters test
```
