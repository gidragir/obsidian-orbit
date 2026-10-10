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
| **dev-vault** | Разработка и тестирование плагинов. | `dev-vault/.obsidian/plugins/tiling-renderer/src/main.ts, dev-vault/.obsidian/plugins/tabs-renderer/src/main.ts, dev-vault/.obsidian/plugins/html-renderer/src/main.ts, dev-vault/.obsidian/plugins/tabs-renderer/package.json, dev-vault/.obsidian/plugins/tiling-renderer/package.json, dev-vault/.obsidian/plugins/html-renderer/package.json, dev-vault/.obsidian/plugins/snippet-renderer/package.json, dev-vault/.obsidian/plugins/snippet-renderer/src/main.ts` | ~123944 | [subsystems/dev-vault.md](subsystems/dev-vault.md) |
| **adapters** | Адаптеры для взаимодействия с Obsidian API. | `packages/adapters/package.json, packages/adapters/src/index.ts` | ~2299 | [subsystems/adapters.md](subsystems/adapters.md) |
| **core** | Ядро системы, включающее структуру и геометрию тайлов. | `packages/core/package.json, packages/core/src/index.ts` | ~12450 | [subsystems/core.md](subsystems/core.md) |
| **obsidian-utils** | Утилиты для работы с Obsidian, такие как парсинг ссылок и форматирование. | `packages/obsidian-utils/src/index.ts, packages/obsidian-utils/package.json` | ~1738 | [subsystems/obsidian-utils.md](subsystems/obsidian-utils.md) |
| **ports** | Интерфейсы для взаимодействия с внешними системами. | `packages/ports/src/index.ts, packages/ports/package.json` | ~388 | [subsystems/ports.md](subsystems/ports.md) |
| **tsconfig** | Конфигурации TypeScript для проекта. | `packages/tsconfig/package.json` | ~263 | [subsystems/tsconfig.md](subsystems/tsconfig.md) |
| **types** | Типы для обработки результатов и ошибок. | `packages/types/src/index.ts, packages/types/package.json` | ~449 | [subsystems/types.md](subsystems/types.md) |
| **ui** | Интерфейс пользователя для редактирования и взаимодействия. | `packages/ui/package.json, packages/ui/src/index.ts` | ~5326 | [subsystems/ui.md](subsystems/ui.md) |
| **reference** | Справочная информация и примеры использования плагинов. | `reference/obsidian-tabs/src/main.ts, reference/snippet-templater/src/main.ts, reference/html-renderer/src/main.ts, reference/snippet-templater/package.json, reference/html-renderer/package.json, reference/obsidian-tabs/package.json, reference/obsidian-tabs/docs/.vitepress/theme/index.ts` | ~332778 | [subsystems/reference.md](subsystems/reference.md) |
| **scripts** | Скрипты для автоматизации процессов сборки и развертывания. | `-` | ~4780 | [subsystems/scripts.md](subsystems/scripts.md) |

## 📋 Инварианты и правила проекта
- Строгая типизация (`TypeScript strict: true`) обязательна, запрещен `any`.
- Все зависимости фиксируются строго в lockfile (`pnpm-lock.yaml` / `bun.lock`).
- Форматирование и линтинг через `rtk biome / rtk prettier` без отключения проверок.
