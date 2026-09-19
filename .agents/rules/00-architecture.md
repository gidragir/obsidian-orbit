---
trigger: always_on
description: "Core architectural invariants of the Obsidian plugins monorepo. Enforces Direct TS Source, strict path aliases, Zero-copy symlinks, and Ports & Adapters separation."
---

# 00: Core Monorepo Architecture Invariants

1. **Единый источник правды (SSOT):** Вся разработка ведется в данном монорепозитории. Сателлиты — только downstream mirrors.
2. **Direct TS Source:** Пакеты `@packages/*` не имеют фазы сборки `dist/`. Импортируются чистые TS-исходники.
3. **Pinpoint-версионирование:** Запрет `^` и `~`. Пакеты линкуются через `workspace:*`, зависимости через `catalog:`.
4. **Запрет относительных импортов вверх:** Запрещено `../../` внутри плагинов. Используются `@ui/*`, `@settings/*`, `@services/*` и `@packages/*`.
5. **Неприкосновенность `.vault/`:** Прямые правки запрещены. Доступ только через `pnpm vault:link`.
