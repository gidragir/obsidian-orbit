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
| `typecheck` | `rtk turbo run typecheck` |
| `vault:link` | `rtk tsx scripts/link-vault.ts` |
| `runner` | `mise (task runner)` |
| `dev` | `rtk tsx scripts/link-vault.ts && turbo run dev` |
| `ai:context:all` | `rtk tsx scripts/generate-ai-context.ts --all` |
| `version:bump` | `rtk changeset version && tsx scripts/sync-versions.ts && pnpm install --no-frozen-lockfile` |
| `release` | `rtk turbo run build && tsx scripts/deploy-downstream.ts` |
| `lint` | `rtk biome check --write .` |
| `test` | `rtk vitest run` |
| `build` | `rtk turbo run build` |
| `check` | `rtk biome check . && turbo run typecheck test build` |
| `ai:context` | `rtk tsx scripts/generate-ai-context.ts` |
| `change` | `rtk changeset` |
| `release:merge` | `rtk tsx scripts/merge-release-pr.ts` |

## Быстрый запуск
```bash
rtk pnpm run build
rtk pnpm test
```
