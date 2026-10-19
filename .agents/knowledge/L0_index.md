# 🗺 Architecture map: obsidian-orbit (L0)

> **Stack:** TypeScript / JavaScript (Node/Bun/Deno) | **Updated:** 2026-10-19
> **Description:** Centralized monorepo (Single Source of Truth, SSOT) for designing, developing, testing, building and independently distributing plugins of the Obsidian.md ecosystem, along with accompanying shared libraries.

## 🚪 Entry points (Root Entrypoints)
- `package.json`
- `mise.toml`

## ⚡️ Quick commands
```bash
# Build
rtk pnpm run build

# Tests
rtk pnpm test

# Linter
rtk pnpm run lint

# Run
rtk pnpm run dev

```

## 🧩 Subsystem catalog (L1)

| Subsystem | Role / Purpose | Entry points | Tokens (BPE) | L1 Card |
| :--- | :--- | :--- | :--- | :--- |
| **.changeset** | Configuration for managing changes in the project. | `-` | ~106 | [subsystems/changeset.md](subsystems/changeset.md) |
| **.vault** | Contains plugin source files and their configurations. | `.vault/.obsidian/plugins/tiling-renderer/src/main.ts, .vault/.obsidian/plugins/tabs-renderer/src/main.ts, .vault/.obsidian/plugins/html-renderer/src/main.ts, .vault/.obsidian/plugins/tabs-renderer/package.json, .vault/.obsidian/plugins/tiling-renderer/package.json, .vault/.obsidian/plugins/html-renderer/package.json, .vault/.obsidian/plugins/snippet-renderer/package.json, .vault/.obsidian/plugins/snippet-renderer/src/main.ts` | ~123944 | [subsystems/vault.md](subsystems/vault.md) |
| **dev-vault** | Plugin development and testing. | `dev-vault/.obsidian/plugins/tiling-renderer/src/main.ts, dev-vault/.obsidian/plugins/vault-renderer/src/main.ts, dev-vault/.obsidian/plugins/tabs-renderer/src/main.ts, dev-vault/.obsidian/plugins/html-renderer/src/main.ts, dev-vault/.obsidian/plugins/tabs-renderer/package.json, dev-vault/.obsidian/plugins/html-renderer/package.json, dev-vault/.obsidian/plugins/snippet-renderer/package.json, dev-vault/.obsidian/plugins/tiling-renderer/package.json, dev-vault/.obsidian/plugins/vault-renderer/package.json, dev-vault/.obsidian/plugins/snippet-renderer/src/main.ts` | ~122776 | [subsystems/dev-vault.md](subsystems/dev-vault.md) |
| **adapters** | Adapters for interacting with the Obsidian API. | `packages/adapters/package.json, packages/adapters/src/index.ts` | ~2299 | [subsystems/adapters.md](subsystems/adapters.md) |
| **core** | The system core, including tile structure and geometry. | `packages/core/package.json, packages/core/src/index.ts` | ~12450 | [subsystems/core.md](subsystems/core.md) |
| **obsidian-utils** | Utilities for working with Obsidian, such as link parsing and formatting. | `packages/obsidian-utils/src/index.ts, packages/obsidian-utils/package.json` | ~1738 | [subsystems/obsidian-utils.md](subsystems/obsidian-utils.md) |
| **ports** | Interfaces for interacting with external systems. | `packages/ports/src/index.ts, packages/ports/package.json` | ~388 | [subsystems/ports.md](subsystems/ports.md) |
| **tsconfig** | TypeScript configurations for the project. | `packages/tsconfig/package.json` | ~263 | [subsystems/tsconfig.md](subsystems/tsconfig.md) |
| **types** | Types for handling results and errors. | `packages/types/src/index.ts, packages/types/package.json` | ~449 | [subsystems/types.md](subsystems/types.md) |
| **ui** | User interface for editing and interaction. | `packages/ui/package.json, packages/ui/src/index.ts` | ~5326 | [subsystems/ui.md](subsystems/ui.md) |
| **reference** | Reference information and plugin usage examples. | `reference/obsidian-tabs/src/main.ts, reference/snippet-templater/src/main.ts, reference/html-renderer/src/main.ts, reference/snippet-templater/package.json, reference/html-renderer/package.json, reference/obsidian-tabs/package.json, reference/obsidian-tabs/docs/.vitepress/theme/index.ts` | ~332778 | [subsystems/reference.md](subsystems/reference.md) |
| **scripts** | Scripts for automating build and deployment processes. | `-` | ~4780 | [subsystems/scripts.md](subsystems/scripts.md) |
| **.changeset** | Module and components of the `.changeset` directory (1 files) | `-` | ~106 | [subsystems/.changeset.md](subsystems/.changeset.md) |
| **.vault** | Subsystem `.vault` with key entry points: .vault/.obsidian/plugins/tiling-renderer/src/main.ts, .vault/.obsidian/plugins/tabs-renderer/src/main.ts, .vault/.obsidian/plugins/html-renderer/src/main.ts, .vault/.obsidian/plugins/tabs-renderer/package.json, .vault/.obsidian/plugins/html-renderer/package.json, .vault/.obsidian/plugins/snippet-renderer/package.json, .vault/.obsidian/plugins/tiling-renderer/package.json, .vault/.obsidian/plugins/snippet-renderer/src/main.ts | `.vault/.obsidian/plugins/tiling-renderer/src/main.ts, .vault/.obsidian/plugins/tabs-renderer/src/main.ts, .vault/.obsidian/plugins/html-renderer/src/main.ts, .vault/.obsidian/plugins/tabs-renderer/package.json, .vault/.obsidian/plugins/html-renderer/package.json, .vault/.obsidian/plugins/snippet-renderer/package.json, .vault/.obsidian/plugins/tiling-renderer/package.json, .vault/.obsidian/plugins/snippet-renderer/src/main.ts` | ~123230 | [subsystems/.vault.md](subsystems/.vault.md) |
| **Adapters** | Subsystem `packages/adapters` with key entry points: packages/adapters/package.json, packages/adapters/src/index.ts | `packages/adapters/package.json, packages/adapters/src/index.ts` | ~3137 | [subsystems/packages_adapters.md](subsystems/packages_adapters.md) |
| **Core** | Subsystem `packages/core` with key entry points: packages/core/package.json, packages/core/src/index.ts | `packages/core/package.json, packages/core/src/index.ts` | ~12811 | [subsystems/packages_core.md](subsystems/packages_core.md) |
| **Obsidian Utils** | Subsystem `packages/obsidian-utils` with key entry points: packages/obsidian-utils/src/index.ts, packages/obsidian-utils/package.json | `packages/obsidian-utils/src/index.ts, packages/obsidian-utils/package.json` | ~1738 | [subsystems/packages_obsidian-utils.md](subsystems/packages_obsidian-utils.md) |
| **Ports** | Subsystem `packages/ports` with key entry points: packages/ports/src/index.ts, packages/ports/package.json | `packages/ports/src/index.ts, packages/ports/package.json` | ~388 | [subsystems/packages_ports.md](subsystems/packages_ports.md) |
| **Tsconfig** | Subsystem `packages/tsconfig` with key entry points: packages/tsconfig/package.json | `packages/tsconfig/package.json` | ~263 | [subsystems/packages_tsconfig.md](subsystems/packages_tsconfig.md) |
| **Types** | Subsystem `packages/types` with key entry points: packages/types/src/index.ts, packages/types/package.json | `packages/types/src/index.ts, packages/types/package.json` | ~449 | [subsystems/packages_types.md](subsystems/packages_types.md) |
| **Ui** | Subsystem `packages/ui` with key entry points: packages/ui/package.json, packages/ui/src/index.ts | `packages/ui/package.json, packages/ui/src/index.ts` | ~7086 | [subsystems/packages_ui.md](subsystems/packages_ui.md) |
| **Html Renderer** | Subsystem `plugins/html-renderer` with key entry points: plugins/html-renderer/src/main.ts, plugins/html-renderer/package.json | `plugins/html-renderer/src/main.ts, plugins/html-renderer/package.json` | ~117754 | [subsystems/plugins_html-renderer.md](subsystems/plugins_html-renderer.md) |
| **Snippet Renderer** | Subsystem `plugins/snippet-renderer` with key entry points: plugins/snippet-renderer/package.json, plugins/snippet-renderer/src/main.ts | `plugins/snippet-renderer/package.json, plugins/snippet-renderer/src/main.ts` | ~113361 | [subsystems/plugins_snippet-renderer.md](subsystems/plugins_snippet-renderer.md) |
| **Tabs Renderer** | Subsystem `plugins/tabs-renderer` with key entry points: plugins/tabs-renderer/src/main.ts, plugins/tabs-renderer/package.json | `plugins/tabs-renderer/src/main.ts, plugins/tabs-renderer/package.json` | ~10104 | [subsystems/plugins_tabs-renderer.md](subsystems/plugins_tabs-renderer.md) |
| **Tiling Renderer** | Subsystem `plugins/tiling-renderer` with key entry points: plugins/tiling-renderer/src/main.ts, plugins/tiling-renderer/package.json | `plugins/tiling-renderer/src/main.ts, plugins/tiling-renderer/package.json` | ~127895 | [subsystems/plugins_tiling-renderer.md](subsystems/plugins_tiling-renderer.md) |
| **Vault Renderer** | Subsystem `plugins/vault-renderer` with key entry points: plugins/vault-renderer/src/main.ts, plugins/vault-renderer/package.json | `plugins/vault-renderer/src/main.ts, plugins/vault-renderer/package.json` | ~13535 | [subsystems/plugins_vault-renderer.md](subsystems/plugins_vault-renderer.md) |

## 📋 Project invariants and rules
- Strict typing (`TypeScript strict: true`) is mandatory, `any` is prohibited.
- All dependencies are pinned strictly in the lockfile (`pnpm-lock.yaml` / `bun.lock`).
- Formatting and linting via `rtk biome / rtk prettier` without disabling checks.
