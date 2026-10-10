# Подсистема: reference (L1)

> **Идентификатор:** `reference`
> **Теги:** reference, examples | **Объем:** ~332778 токенов BPE

## 🎯 Назначение и роль
Справочная информация и примеры использования плагинов.

## 📁 Точки входа и структура файлов

| Файл | Строк | Статус |
| :--- | :--- | :--- |
| `reference/obsidian-tabs/src/main.ts` | 156 | ⭐ Точка входа |
| `reference/snippet-templater/src/main.ts` | 37 | ⭐ Точка входа |
| `reference/html-renderer/src/main.ts` | 35 | ⭐ Точка входа |
| `reference/snippet-templater/package.json` | 30 | ⭐ Точка входа |
| `reference/html-renderer/package.json` | 30 | ⭐ Точка входа |
| `reference/obsidian-tabs/package.json` | 30 | ⭐ Точка входа |
| `reference/obsidian-tabs/docs/.vitepress/theme/index.ts` | 17 | ⭐ Точка входа |
| `reference/obsidian-tabs-context.md` | 7759 | Исходный код |
| `reference/snippet-templater/pnpm-lock.yaml` | 5012 | Исходный код |
| `reference/html-renderer/pnpm-lock.yaml` | 5012 | Исходный код |
| `reference/obsidian-tabs/package-lock.json` | 2870 | Исходный код |
| `reference/html-renderer-context.md` | 1379 | Исходный код |
| `reference/snippet-templater-context.md` | 1315 | Исходный код |
| `reference/obsidian-tabs/src/components/editor/tab-editor.ts` | 859 | Исходный код |
| `reference/obsidian-tabs/src/settings.ts` | 561 | Исходный код |

## 🔑 Ключевой контракт и экспорты
```text
export class TabEditor
export interface TabsSettings
export const DEFAULT_SETTINGS: TabsSettings =
export class TabsSettingsTab extends PluginSettingTab
```

## 🧪 Запуск и тестирование
```bash
rtk pnpm test
```
