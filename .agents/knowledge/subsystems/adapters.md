# Subsystem: adapters (L1)

> **Identifier:** `adapters`
> **Tags:** adapters, api | **Size:** ~2299 BPE tokens

## 🎯 Purpose and role
Adapters for interacting with the Obsidian API.

## 📁 Entry points and file structure

| File | Lines | Status |
| :--- | :--- | :--- |
| `packages/adapters/package.json` | 30 | ⭐ Entry point |
| `packages/adapters/src/index.ts` | 14 | ⭐ Entry point |
| `packages/adapters/src/editor.ts` | 108 | Source code |
| `packages/adapters/src/vault.ts` | 97 | Source code |
| `packages/adapters/src/settings.ts` | 38 | Source code |
| `packages/adapters/src/command.ts` | 35 | Source code |
| `packages/adapters/src/clipboard.ts` | 20 | Source code |
| `packages/adapters/src/notice.ts` | 8 | Source code |
| `packages/adapters/src/debounced-file-sync.ts` | 50 | Source code |
| `packages/adapters/src/declarative-setting-tab.ts` | 75 | Source code |
| `packages/adapters/tsconfig.json` | 4 | Source code |

## 🔑 Key contract and exports
```text
export function replaceCodeBlock( editor: Editor, sectionInfo: MarkdownSectionInformation, newBlockContent: string, expectedFencePrefix?: string ): boolean
export class ObsidianVaultAdapter implements IVaultPort
export interface SettingsStorage
export class ObsidianSettingsAdapter<T> implements ISettingsPort<T>
export class ObsidianCommandAdapter implements ICommandPort
export class ClipboardAdapter implements IClipboardPort
export class ObsidianNoticeAdapter implements INoticePort
export class DebouncedFileSyncAdapter implements IFileSyncPort
export class DeclarativeSettingTabAdapter implements ISettingTabPort
```

## 🧪 Running and testing
```bash
rtk pnpm --filter adapters test
```
