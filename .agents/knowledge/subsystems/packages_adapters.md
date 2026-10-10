# Подсистема: Adapters (L1)

> **Идентификатор:** `packages_adapters`
> **Теги:** packages_adapters, TypeScript / JavaScript (Node/Bun/Deno) | **Объем:** ~3137 токенов BPE

## 🎯 Назначение и роль
Подсистема `packages/adapters` с ключевыми точками входа: packages/adapters/package.json, packages/adapters/src/index.ts

## 📁 Точки входа и структура файлов

| Файл | Строк | Статус |
| :--- | :--- | :--- |
| `packages/adapters/package.json` | 30 | ⭐ Точка входа |
| `packages/adapters/src/index.ts` | 12 | ⭐ Точка входа |
| `packages/adapters/src/editor.ts` | 108 | Исходный код |
| `packages/adapters/src/vault.ts` | 97 | Исходный код |
| `packages/adapters/src/debounced-file-sync.ts` | 79 | Исходный код |
| `packages/adapters/src/settings.ts` | 38 | Исходный код |
| `packages/adapters/src/command.ts` | 35 | Исходный код |
| `packages/adapters/src/declarative-setting-tab.ts` | 32 | Исходный код |
| `packages/adapters/src/clipboard.ts` | 20 | Исходный код |
| `packages/adapters/src/notice.ts` | 8 | Исходный код |
| `packages/adapters/tsconfig.json` | 4 | Исходный код |

## 🔑 Ключевой контракт и экспорты
```text
export function replaceCodeBlock( editor: Editor, sectionInfo: MarkdownSectionInformation, newBlockContent: string, expectedFencePrefix?: string ): boolean
export class ObsidianVaultAdapter implements IVaultPort
export interface DebouncedWorkspaceFileAdapterOptions
export class DebouncedWorkspaceFileAdapter
```

## 🧪 Запуск и тестирование
```bash
rtk pnpm --filter adapters test
```
