# Подсистема: Snippet Renderer (L1)

> **Идентификатор:** `plugins_snippet-renderer`
> **Теги:** plugins_snippet-renderer, TypeScript / JavaScript (Node/Bun/Deno) | **Объем:** ~113361 токенов BPE

## 🎯 Назначение и роль
Подсистема `plugins/snippet-renderer` с ключевыми точками входа: plugins/snippet-renderer/package.json, plugins/snippet-renderer/src/main.ts

## 📁 Точки входа и структура файлов

| Файл | Строк | Статус |
| :--- | :--- | :--- |
| `plugins/snippet-renderer/package.json` | 31 | ⭐ Точка входа |
| `plugins/snippet-renderer/src/main.ts` | 19 | ⭐ Точка входа |
| `plugins/snippet-renderer/src/ui/snippet-render-child.ts` | 231 | Исходный код |
| `plugins/snippet-renderer/src/utils/parser.test.ts` | 112 | Исходный код |
| `plugins/snippet-renderer/src/utils/parser.ts` | 74 | Исходный код |
| `plugins/snippet-renderer/README.md` | 44 | Исходный код |
| `plugins/snippet-renderer/main.js` | 38 | Исходный код |
| `plugins/snippet-renderer/src/utils/fence.test.ts` | 15 | Исходный код |
| `plugins/snippet-renderer/tsconfig.json` | 10 | Исходный код |
| `plugins/snippet-renderer/CHANGELOG.md` | 10 | Исходный код |
| `plugins/snippet-renderer/manifest.json` | 9 | Исходный код |
| `plugins/snippet-renderer/src/utils/fence.ts` | 7 | Исходный код |
| `plugins/snippet-renderer/versions.json` | 3 | Исходный код |

## 🔑 Ключевой контракт и экспорты
```text
export class SnippetRenderChild extends MarkdownRenderChild
export interface ParsedTemplate
export function parseLanguageAndSource(source: string, fenceHeader?: string): ParsedTemplate
export function extractVariables(source: string): readonly string[]
export function substituteVariables( source: string, values: Readonly<Record<string, string>> ): string
```

## 🧪 Запуск и тестирование
```bash
rtk pnpm --filter snippet-renderer test
```
