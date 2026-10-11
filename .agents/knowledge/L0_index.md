# 🗺 Карта архитектуры: obsidian-orbit (L0)

> **Стек:** TypeScript / JavaScript (Node/Bun/Deno) | **Обновлено:** 2026-10-10
> **Описание:** Централизованный монорепозиторий (Single Source of Truth, SSOT) для проектирования, разработки, тестирования, сборки и независимого распространения плагинов экосистемы Obsidian.md, а также сопутствующих разделяемых библи

## 🚪 Точки входа (Root Entrypoints)
- `package.json`
- `mise.toml`

## ⚡️ Быстрые команды
```bash
# Сборка
rtk pnpm run build

# Тесты
rtk pnpm test

# Линтер
rtk pnpm run lint

# Запуск
rtk pnpm run dev

```

## 🧩 Каталог подсистем (L1)

| Подсистема | Роль / Назначение | Точки входа | Токены (BPE) | L1 Карточка |
| :--- | :--- | :--- | :--- | :--- |
| **.changeset** | Конфигурация для управления изменениями в проекте. | `-` | ~106 | [subsystems/changeset.md](subsystems/changeset.md) |
| **.vault** | Содержит исходные файлы плагинов и их конфигурации. | `.vault/.obsidian/plugins/tiling-renderer/src/main.ts, .vault/.obsidian/plugins/tabs-renderer/src/main.ts, .vault/.obsidian/plugins/html-renderer/src/main.ts, .vault/.obsidian/plugins/tabs-renderer/package.json, .vault/.obsidian/plugins/tiling-renderer/package.json, .vault/.obsidian/plugins/html-renderer/package.json, .vault/.obsidian/plugins/snippet-renderer/package.json, .vault/.obsidian/plugins/snippet-renderer/src/main.ts` | ~123944 | [subsystems/vault.md](subsystems/vault.md) |
| **dev-vault** | Разработка и тестирование плагинов. | `dev-vault/.obsidian/plugins/tiling-renderer/src/main.ts, dev-vault/.obsidian/plugins/tabs-renderer/src/main.ts, dev-vault/.obsidian/plugins/html-renderer/src/main.ts, dev-vault/.obsidian/plugins/tabs-renderer/package.json, dev-vault/.obsidian/plugins/html-renderer/package.json, dev-vault/.obsidian/plugins/snippet-renderer/package.json, dev-vault/.obsidian/plugins/tiling-renderer/package.json, dev-vault/.obsidian/plugins/snippet-renderer/src/main.ts` | ~122382 | [subsystems/dev-vault.md](subsystems/dev-vault.md) |
| **adapters** | Адаптеры для взаимодействия с Obsidian API. | `packages/adapters/package.json, packages/adapters/src/index.ts` | ~2299 | [subsystems/adapters.md](subsystems/adapters.md) |
| **core** | Ядро системы, включающее структуру и геометрию тайлов. | `packages/core/package.json, packages/core/src/index.ts` | ~12450 | [subsystems/core.md](subsystems/core.md) |
| **obsidian-utils** | Утилиты для работы с Obsidian, такие как парсинг ссылок и форматирование. | `packages/obsidian-utils/src/index.ts, packages/obsidian-utils/package.json` | ~1738 | [subsystems/obsidian-utils.md](subsystems/obsidian-utils.md) |
| **ports** | Интерфейсы для взаимодействия с внешними системами. | `packages/ports/src/index.ts, packages/ports/package.json` | ~388 | [subsystems/ports.md](subsystems/ports.md) |
| **tsconfig** | Конфигурации TypeScript для проекта. | `packages/tsconfig/package.json` | ~263 | [subsystems/tsconfig.md](subsystems/tsconfig.md) |
| **types** | Типы для обработки результатов и ошибок. | `packages/types/src/index.ts, packages/types/package.json` | ~449 | [subsystems/types.md](subsystems/types.md) |
| **ui** | Интерфейс пользователя для редактирования и взаимодействия. | `packages/ui/package.json, packages/ui/src/index.ts` | ~5326 | [subsystems/ui.md](subsystems/ui.md) |
| **reference** | Справочная информация и примеры использования плагинов. | `reference/obsidian-tabs/src/main.ts, reference/snippet-templater/src/main.ts, reference/html-renderer/src/main.ts, reference/snippet-templater/package.json, reference/html-renderer/package.json, reference/obsidian-tabs/package.json, reference/obsidian-tabs/docs/.vitepress/theme/index.ts` | ~332778 | [subsystems/reference.md](subsystems/reference.md) |
| **scripts** | Скрипты для автоматизации процессов сборки и развертывания. | `-` | ~4780 | [subsystems/scripts.md](subsystems/scripts.md) |
| **.changeset** | Модуль и компоненты директории `.changeset` (1 файлов) | `-` | ~106 | [subsystems/.changeset.md](subsystems/.changeset.md) |
| **.vault** | Подсистема `.vault` с ключевыми точками входа: .vault/.obsidian/plugins/tiling-renderer/src/main.ts, .vault/.obsidian/plugins/tabs-renderer/src/main.ts, .vault/.obsidian/plugins/html-renderer/src/main.ts, .vault/.obsidian/plugins/tabs-renderer/package.json, .vault/.obsidian/plugins/html-renderer/package.json, .vault/.obsidian/plugins/snippet-renderer/package.json, .vault/.obsidian/plugins/tiling-renderer/package.json, .vault/.obsidian/plugins/snippet-renderer/src/main.ts | `.vault/.obsidian/plugins/tiling-renderer/src/main.ts, .vault/.obsidian/plugins/tabs-renderer/src/main.ts, .vault/.obsidian/plugins/html-renderer/src/main.ts, .vault/.obsidian/plugins/tabs-renderer/package.json, .vault/.obsidian/plugins/html-renderer/package.json, .vault/.obsidian/plugins/snippet-renderer/package.json, .vault/.obsidian/plugins/tiling-renderer/package.json, .vault/.obsidian/plugins/snippet-renderer/src/main.ts` | ~123230 | [subsystems/.vault.md](subsystems/.vault.md) |
| **Adapters** | Подсистема `packages/adapters` с ключевыми точками входа: packages/adapters/package.json, packages/adapters/src/index.ts | `packages/adapters/package.json, packages/adapters/src/index.ts` | ~3137 | [subsystems/packages_adapters.md](subsystems/packages_adapters.md) |
| **Core** | Подсистема `packages/core` с ключевыми точками входа: packages/core/package.json, packages/core/src/index.ts | `packages/core/package.json, packages/core/src/index.ts` | ~12811 | [subsystems/packages_core.md](subsystems/packages_core.md) |
| **Obsidian Utils** | Подсистема `packages/obsidian-utils` с ключевыми точками входа: packages/obsidian-utils/src/index.ts, packages/obsidian-utils/package.json | `packages/obsidian-utils/src/index.ts, packages/obsidian-utils/package.json` | ~1738 | [subsystems/packages_obsidian-utils.md](subsystems/packages_obsidian-utils.md) |
| **Ports** | Подсистема `packages/ports` с ключевыми точками входа: packages/ports/src/index.ts, packages/ports/package.json | `packages/ports/src/index.ts, packages/ports/package.json` | ~388 | [subsystems/packages_ports.md](subsystems/packages_ports.md) |
| **Tsconfig** | Подсистема `packages/tsconfig` с ключевыми точками входа: packages/tsconfig/package.json | `packages/tsconfig/package.json` | ~263 | [subsystems/packages_tsconfig.md](subsystems/packages_tsconfig.md) |
| **Types** | Подсистема `packages/types` с ключевыми точками входа: packages/types/src/index.ts, packages/types/package.json | `packages/types/src/index.ts, packages/types/package.json` | ~449 | [subsystems/packages_types.md](subsystems/packages_types.md) |
| **Ui** | Подсистема `packages/ui` с ключевыми точками входа: packages/ui/package.json, packages/ui/src/index.ts | `packages/ui/package.json, packages/ui/src/index.ts` | ~7086 | [subsystems/packages_ui.md](subsystems/packages_ui.md) |
| **Html Renderer** | Подсистема `plugins/html-renderer` с ключевыми точками входа: plugins/html-renderer/src/main.ts, plugins/html-renderer/package.json | `plugins/html-renderer/src/main.ts, plugins/html-renderer/package.json` | ~117754 | [subsystems/plugins_html-renderer.md](subsystems/plugins_html-renderer.md) |
| **Snippet Renderer** | Подсистема `plugins/snippet-renderer` с ключевыми точками входа: plugins/snippet-renderer/package.json, plugins/snippet-renderer/src/main.ts | `plugins/snippet-renderer/package.json, plugins/snippet-renderer/src/main.ts` | ~113361 | [subsystems/plugins_snippet-renderer.md](subsystems/plugins_snippet-renderer.md) |
| **Tabs Renderer** | Подсистема `plugins/tabs-renderer` с ключевыми точками входа: plugins/tabs-renderer/src/main.ts, plugins/tabs-renderer/package.json | `plugins/tabs-renderer/src/main.ts, plugins/tabs-renderer/package.json` | ~10104 | [subsystems/plugins_tabs-renderer.md](subsystems/plugins_tabs-renderer.md) |
| **Tiling Renderer** | Подсистема `plugins/tiling-renderer` с ключевыми точками входа: plugins/tiling-renderer/src/main.ts, plugins/tiling-renderer/package.json | `plugins/tiling-renderer/src/main.ts, plugins/tiling-renderer/package.json` | ~128073 | [subsystems/plugins_tiling-renderer.md](subsystems/plugins_tiling-renderer.md) |

## 📋 Инварианты и правила проекта
- Строгая типизация (`TypeScript strict: true`) обязательна, запрещен `any`.
- Все зависимости фиксируются строго в lockfile (`pnpm-lock.yaml` / `bun.lock`).
- Форматирование и линтинг через `rtk biome / rtk prettier` без отключения проверок.
