# Подсистема: Tabs Renderer (L1)

> **Идентификатор:** `plugins_tabs-renderer`
> **Теги:** plugins_tabs-renderer, TypeScript / JavaScript (Node/Bun/Deno) | **Объем:** ~10104 токенов BPE

## 🎯 Назначение и роль
Подсистема `plugins/tabs-renderer` с ключевыми точками входа: plugins/tabs-renderer/src/main.ts, plugins/tabs-renderer/package.json

## 📁 Точки входа и структура файлов

| Файл | Строк | Статус |
| :--- | :--- | :--- |
| `plugins/tabs-renderer/src/main.ts` | 70 | ⭐ Точка входа |
| `plugins/tabs-renderer/package.json` | 37 | ⭐ Точка входа |
| `plugins/tabs-renderer/src/ui/settings/tabs-setting-tab.ts` | 306 | Исходный код |
| `plugins/tabs-renderer/src/ui/tabs-view.ts` | 213 | Исходный код |
| `plugins/tabs-renderer/src/ui/editor/toolbar.ts` | 97 | Исходный код |
| `plugins/tabs-renderer/src/utils/tabs-parser.ts` | 96 | Исходный код |
| `plugins/tabs-renderer/src/utils/tabs-parser.test.ts` | 88 | Исходный код |
| `plugins/tabs-renderer/src/ui/editor/tab-editor.ts` | 82 | Исходный код |
| `plugins/tabs-renderer/src/ui/dnd-controller.ts` | 75 | Исходный код |
| `plugins/tabs-renderer/src/ui/editor/keymaps.ts` | 74 | Исходный код |
| `plugins/tabs-renderer/src/ui/editor/table-menu.ts` | 63 | Исходный код |
| `plugins/tabs-renderer/src/utils/tabs-serializer.test.ts` | 58 | Исходный код |
| `plugins/tabs-renderer/src/settings/settings.ts` | 53 | Исходный код |
| `plugins/tabs-renderer/src/services/editor-service.ts` | 46 | Исходный код |
| `plugins/tabs-renderer/src/utils/config-parser.test.ts` | 45 | Исходный код |

## 🔑 Ключевой контракт и экспорты
```text
export interface ITabsPluginHost extends Plugin
export class TabsSettingsTab extends PluginSettingTab
export class TabsView extends MarkdownRenderChild
export class EditorToolbar
```

## 🧪 Запуск и тестирование
```bash
rtk pnpm --filter tabs-renderer test
```
