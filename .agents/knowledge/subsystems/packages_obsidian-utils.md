# Подсистема: Obsidian Utils (L1)

> **Идентификатор:** `packages_obsidian-utils`
> **Теги:** packages_obsidian-utils, TypeScript / JavaScript (Node/Bun/Deno) | **Объем:** ~1738 токенов BPE

## 🎯 Назначение и роль
Подсистема `packages/obsidian-utils` с ключевыми точками входа: packages/obsidian-utils/src/index.ts, packages/obsidian-utils/package.json

## 📁 Точки входа и структура файлов

| Файл | Строк | Статус |
| :--- | :--- | :--- |
| `packages/obsidian-utils/src/index.ts` | 109 | ⭐ Точка входа |
| `packages/obsidian-utils/package.json` | 27 | ⭐ Точка входа |
| `packages/obsidian-utils/src/index.test.ts` | 96 | Исходный код |
| `packages/obsidian-utils/tsconfig.json` | 4 | Исходный код |

## 🔑 Ключевой контракт и экспорты
```text
export interface ParsedWikiLink
export function formatWikiLink(target: string, alias?: string): string
export function parseWikiLink(raw: string): ParsedWikiLink | null
export function sanitizeFileName(name: string): string
export function parseKeyValueFrontmatter(raw: string): Record<string, string>
export function formatCodeBlock( tag: string, content: string, fenceChar: '`' | '~' = '`', minFenceLength = 3 ): string
```

## 🧪 Запуск и тестирование
```bash
rtk pnpm --filter obsidian-utils test
```
