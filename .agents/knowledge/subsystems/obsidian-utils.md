# Subsystem: obsidian-utils (L1)

> **Identifier:** `obsidian-utils`
> **Tags:** utils, parsing | **Size:** ~1738 BPE tokens

## 🎯 Purpose and role
Utilities for working with Obsidian, such as link parsing and formatting.

## 📁 Entry points and file structure

| File | Lines | Status |
| :--- | :--- | :--- |
| `packages/obsidian-utils/src/index.ts` | 109 | ⭐ Entry point |
| `packages/obsidian-utils/package.json` | 27 | ⭐ Entry point |
| `packages/obsidian-utils/src/index.test.ts` | 96 | Source code |
| `packages/obsidian-utils/tsconfig.json` | 4 | Source code |

## 🔑 Key contract and exports
```text
export interface ParsedWikiLink
export function formatWikiLink(target: string, alias?: string): string
export function parseWikiLink(raw: string): ParsedWikiLink | null
export function sanitizeFileName(name: string): string
export function parseKeyValueFrontmatter(raw: string): Record<string, string>
export function formatCodeBlock( tag: string, content: string, fenceChar: '`' | '~' = '`', minFenceLength = 3 ): string
```

## 🧪 Running and testing
```bash
rtk pnpm --filter obsidian-utils test
```
