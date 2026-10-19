# 🛠 Command reference: obsidian-orbit (L2)

> Automatically extracted from the project configuration (TypeScript / JavaScript (Node/Bun/Deno))

## Standard lifecycle commands

| Task | Command |
| :--- | :--- |
| **Build** | `rtk pnpm run build` |
| **Testing** | `rtk pnpm test` |
| **Linting** | `rtk pnpm run lint` |
| **Formatting** | `rtk pnpm run format` |
| **Run** | `rtk pnpm run dev` |

## Custom scripts and tasks

| Script | Command executed |
| :--- | :--- |
| `vault:link` | `rtk tsx scripts/link-vault.ts` |
| `release:merge` | `rtk tsx scripts/merge-release-pr.ts` |
| `format` | `rtk biome format --write .` |
| `change` | `rtk changeset` |
| `ai:context:all` | `rtk tsx scripts/generate-ai-context.ts --all` |
| `lint` | `rtk biome check --write .` |
| `typecheck` | `rtk turbo run typecheck` |
| `ai:context` | `rtk tsx scripts/generate-ai-context.ts` |
| `runner` | `mise (task runner)` |
| `release` | `rtk turbo run build && tsx scripts/deploy-downstream.ts` |
| `build` | `rtk turbo run build` |
| `version:bump` | `rtk changeset version && tsx scripts/sync-versions.ts && pnpm install --no-frozen-lockfile` |
| `dev` | `rtk tsx scripts/link-vault.ts && turbo run dev` |
| `test` | `rtk vitest run` |
| `check` | `rtk biome check . && turbo run typecheck test build` |

## Quick start
```bash
rtk pnpm run build
rtk pnpm test
```
