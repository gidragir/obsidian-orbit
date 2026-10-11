# Подсистема: Html Renderer (L1)

> **Идентификатор:** `plugins_html-renderer`
> **Теги:** plugins_html-renderer, TypeScript / JavaScript (Node/Bun/Deno) | **Объем:** ~117754 токенов BPE

## 🎯 Назначение и роль
Подсистема `plugins/html-renderer` с ключевыми точками входа: plugins/html-renderer/src/main.ts, plugins/html-renderer/package.json

## 📁 Точки входа и структура файлов

| Файл | Строк | Статус |
| :--- | :--- | :--- |
| `plugins/html-renderer/src/main.ts` | 48 | ⭐ Точка входа |
| `plugins/html-renderer/package.json` | 32 | ⭐ Точка входа |
| `plugins/html-renderer/src/ui/html-render-child.ts` | 209 | Исходный код |
| `plugins/html-renderer/src/settings/settings-tab.ts` | 190 | Исходный код |
| `plugins/html-renderer/src/utils/document-builder.ts` | 123 | Исходный код |
| `plugins/html-renderer/main.js` | 91 | Исходный код |
| `plugins/html-renderer/README.md` | 62 | Исходный код |
| `plugins/html-renderer/src/utils/document-builder.test.ts` | 57 | Исходный код |
| `plugins/html-renderer/src/utils/source-parser.test.ts` | 37 | Исходный код |
| `plugins/html-renderer/src/utils/sandbox.test.ts` | 34 | Исходный код |
| `plugins/html-renderer/src/utils/source-parser.ts` | 20 | Исходный код |
| `plugins/html-renderer/CHANGELOG.md` | 20 | Исходный код |
| `plugins/html-renderer/src/settings/settings.ts` | 19 | Исходный код |
| `plugins/html-renderer/src/services/theme-service.ts` | 18 | Исходный код |
| `plugins/html-renderer/src/services/content-loader.ts` | 17 | Исходный код |

## 🔑 Ключевой контракт и экспорты
```text
export class HTMLRenderChild extends MarkdownRenderChild
export class HTMLRendererSettingTab extends PluginSettingTab
export interface ThemeTokens
export class HTMLDocumentBuilder
```

## 🧪 Запуск и тестирование
```bash
rtk pnpm --filter html-renderer test
```
