# Подсистема: adapters (L1)

> **Идентификатор:** `adapters`
> **Теги:** adapters, api | **Объем:** ~2299 токенов BPE

## 🎯 Назначение и роль
Адаптеры для взаимодействия с Obsidian API.

## 📁 Точки входа и структура файлов

| Файл | Строк | Статус |
| :--- | :--- | :--- |
| `packages/adapters/package.json` | 30 | ⭐ Точка входа |
| `packages/adapters/src/index.ts` | 14 | ⭐ Точка входа |
| `packages/adapters/src/editor.ts` | 108 | Исходный код |
| `packages/adapters/src/vault.ts` | 97 | Исходный код |
| `packages/adapters/src/settings.ts` | 38 | Исходный код |
| `packages/adapters/src/command.ts` | 35 | Исходный код |
| `packages/adapters/src/clipboard.ts` | 20 | Исходный код |
| `packages/adapters/src/notice.ts` | 8 | Исходный код |
| `packages/adapters/src/debounced-file-sync.ts` | 50 | Исходный код |
| `packages/adapters/src/declarative-setting-tab.ts` | 75 | Исходный код |
| `packages/adapters/tsconfig.json` | 4 | Исходный код |

## 🔑 Ключевой контракт и экспорты
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

## 🧪 Запуск и тестирование
```bash
rtk pnpm --filter adapters test
```
