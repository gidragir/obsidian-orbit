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
| `test` | `rtk vitest run` |
| `release:merge` | `rtk tsx scripts/merge-release-pr.ts` |
| `change` | `rtk changeset` |
| `runner` | `mise (task runner)` |
| `ai:context` | `rtk tsx scripts/generate-ai-context.ts` |
| `dev` | `rtk tsx scripts/link-vault.ts && turbo run dev` |
| `version:bump` | `rtk changeset version && tsx scripts/sync-versions.ts && pnpm install --no-frozen-lockfile` |
| `format` | `rtk biome format --write .` |
| `build` | `rtk turbo run build` |
| `check` | `rtk biome check . && turbo run typecheck test build` |
| `typecheck` | `rtk turbo run typecheck` |
| `lint` | `rtk biome check --write .` |
| `release` | `rtk turbo run build && tsx scripts/deploy-downstream.ts` |
| `ai:context:all` | `rtk tsx scripts/generate-ai-context.ts --all` |
| `vault:link` | `rtk tsx scripts/link-vault.ts` |

## Быстрый запуск
```bash
rtk pnpm run build
rtk pnpm test
```
