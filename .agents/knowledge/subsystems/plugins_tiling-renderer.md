# Подсистема: Tiling Renderer (L1)

> **Идентификатор:** `plugins_tiling-renderer`
> **Теги:** plugins_tiling-renderer, TypeScript / JavaScript (Node/Bun/Deno) | **Объем:** ~128073 токенов BPE

## 🎯 Назначение и роль
Подсистема `plugins/tiling-renderer` с ключевыми точками входа: plugins/tiling-renderer/src/main.ts, plugins/tiling-renderer/package.json

## 📁 Точки входа и структура файлов

| Файл | Строк | Статус |
| :--- | :--- | :--- |
| `plugins/tiling-renderer/src/main.ts` | 312 | ⭐ Точка входа |
| `plugins/tiling-renderer/package.json` | 30 | ⭐ Точка входа |
| `plugins/tiling-renderer/src/ui/tiling-panel-renderer.ts` | 372 | Исходный код |
| `plugins/tiling-renderer/src/ui/tiling-view.ts` | 347 | Исходный код |
| `plugins/tiling-renderer/src/services/tiling-sync-service.test.ts` | 138 | Исходный код |
| `plugins/tiling-renderer/src/services/tiling-sync-service.ts` | 132 | Исходный код |
| `plugins/tiling-renderer/src/settings/settings-tab.ts` | 106 | Исходный код |
| `plugins/tiling-renderer/src/ui/panel-dnd-controller.ts` | 101 | Исходный код |
| `plugins/tiling-renderer/data.json` | 31 | Исходный код |
| `plugins/tiling-renderer/README.md` | 29 | Исходный код |
| `plugins/tiling-renderer/main.js` | 29 | Исходный код |
| `plugins/tiling-renderer/src/settings/settings.ts` | 25 | Исходный код |
| `plugins/tiling-renderer/CHANGELOG.md` | 13 | Исходный код |
| `plugins/tiling-renderer/tsconfig.json` | 12 | Исходный код |
| `plugins/tiling-renderer/manifest.json` | 9 | Исходный код |

## 🔑 Ключевой контракт и экспорты
```text
export interface TilingPanelHost
export class TilingPanelRenderer
export const TILING_VIEW_TYPE = 'orbit-tiling-view' export interface TilingLayoutHost
export class TilingView extends ItemView implements TilingPanelHost
```

## 🧪 Запуск и тестирование
```bash
rtk pnpm --filter tiling-renderer test
```
