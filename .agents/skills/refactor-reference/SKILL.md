---
name: refactor-reference
description: "Dissect and port a third-party Obsidian plugin reference from reference/ directory into modern clean monorepo architecture. Use when adopting, porting, or rebuilding third-party plugins or when invoked via /refactor-reference."
---

# Refactor Reference Skill (/refactor-reference)

1. Проверить наличие `reference/<target>-context.md` (или вызвать `pnpm ai:context <target>`).
2. Провести аудит кода силами Gemini Pro (выявление God-классов, устаревших библиотек).
3. Сформировать Implementation Plan.
4. Создать плагин командой `/new-plugin`.
5. Перенести логику в `utils` (+тесты) -> `services` -> `ui` -> `main.ts`.
6. Выполнить очистку через `complexity-guard` и `biome-refactor`.
7. Финализировать через `pnpm check`.
