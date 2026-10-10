# 🛠 Справочник команд: obsidian-orbit (L2)

> Автоматически извлечено из конфигурации проекта (TypeScript / JavaScript (Node/Bun/Deno))

## Стандартные команды жизненного цикла

| Задача | Команда |
| :--- | :--- |
| **Сборка** | `rtk pnpm run build` |
| **Тестирование** | `rtk pnpm test` |
| **Линтинг** | `rtk pnpm run lint` |
| **Форматирование** | `rtk pnpm run format` |
| **Запуск** | `rtk pnpm run dev` |

## Пользовательские скрипты и задачи

| Скрипт | Выполняемая команда |
| :--- | :--- |
| `format` | `rtk biome format --write .` |
| `dev` | `rtk tsx scripts/link-vault.ts && turbo run dev` |
| `runner` | `mise (task runner)` |
| `vault:link` | `rtk tsx scripts/link-vault.ts` |
| `release` | `rtk turbo run build && tsx scripts/deploy-downstream.ts` |
| `ai:context:all` | `rtk tsx scripts/generate-ai-context.ts --all` |
| `release:merge` | `rtk tsx scripts/merge-release-pr.ts` |
| `ai:context` | `rtk tsx scripts/generate-ai-context.ts` |
| `lint` | `rtk biome check --write .` |
| `test` | `rtk vitest run` |
| `check` | `rtk biome check . && turbo run typecheck test build` |
| `version:bump` | `rtk changeset version && tsx scripts/sync-versions.ts && pnpm install --no-frozen-lockfile` |
| `change` | `rtk changeset` |
| `typecheck` | `rtk turbo run typecheck` |
| `build` | `rtk turbo run build` |

## Быстрый запуск
```bash
rtk pnpm run build
rtk pnpm test
```
