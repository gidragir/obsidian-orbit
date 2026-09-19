---
description: "Autonomous self-healing verification cycle. Runs Biome, TypeScript typecheck, Vitest unit tests, and Turbo build with automatic fixes."
---

# Workflow: /verify

1. Выполнить `pnpm biome check .` (при ошибках запустить `pnpm lint && pnpm format`).
2. Запустить проверку типов: `pnpm turbo run typecheck`.
3. Запустить unit-тесты Vitest: `pnpm turbo run test`.
4. Выполнить тестовую сборку: `pnpm turbo run build`.
5. Сформировать краткий статус-отчет об успешности проверок.
