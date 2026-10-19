# Obsidian Orbit (`obsidian-orbit`)

Author: **gidragir**

A centralized monorepo (Single Source of Truth, SSOT) for designing, developing, testing, building and independently distributing plugins for the Obsidian.md ecosystem, along with their shared libraries.

## 🚀 Architectural Principles

1. **Single Source of Truth (SSOT):** All development, typing, documentation and plugin version history live in the monorepo. Satellite repositories (`obsidian-<plugin-id>`) are strictly downstream release mirrors.
2. **Direct TS Source:** `@packages/*` have no pre-build phase and no `dist/` directories. The `esbuild` bundler inlines plain TypeScript directly into each plugin's monolithic `main.js`.
3. **Pinpoint versioning:** Floating versions (`^`, `~`) are strictly forbidden via `save-exact=true`. All external dependencies are pinned in the `catalog:` section of `pnpm-workspace.yaml`; local links use `workspace:*`.
4. **Ports and Adapters (Hexagonal Architecture):**
   - **Domain types (`@packages/types`):** Pure data structures, the `Result<T, E>` contract, metadata with no external runtime dependencies.
   - **Port contracts (`@packages/ports`):** `IVaultPort`, `ICommandPort`, `ISettingsPort`, `INoticePort`, `IClipboardPort` interfaces with 0% coupling to the Obsidian API and DOM.
   - **Domain core (`@packages/core`, `src/utils/`):** Pure Markdown parsing, path normalization and settings validation algorithms. 100% Vitest coverage.
   - **Implementation adapters (`@packages/adapters`, `src/services/`):** Concrete port implementations on top of `app.vault`, `navigator.clipboard`, `Notice` and Obsidian commands.
5. **Normative code complexity control:**
   - Cognitive Complexity: $\le 15$ per function.
   - Cyclomatic Complexity: $\le 10$ per function ($\le 15$ for structural mappings).
   - Block nesting depth: $\le 3$.
   - Function/method size: $\le 40$ lines.
   - Thin `main.ts` facade (no God class): `onload()` does not exceed 20–30 lines.
6. **Strict TypeScript and Biome standards:** `any`, `enum`, non-null assertion (`!`) and Parameter Properties are fully prohibited.
7. **Pure Vitest unit tests:** Domain logic is tested exclusively in the Node.js runtime (`environment: 'node'`) without browser emulators (`happy-dom`, `jsdom`) or Obsidian class mocks.
8. **Zero-copy loop (`.vault/`):** Plugins are connected to the local test vault via cross-platform symbolic links (`pnpm vault:link`).
9. **OpenViking context protocol and Antigravity 2.0 environment:** A three-tier knowledge base (`.agents/knowledge/`: L0 mental map, L1 subsystems, L2 ADR and CLI) and a tandem of role-based subagents (`executor`, `verifier`, `researcher`, `reviewer`).

---

## 📦 Shared Packages (`packages/*`)

The `@packages/*` architecture follows modular separation of concerns:

| Package | Responsibility | Dependencies |
|---|---|---|
| [`@packages/tsconfig`](packages/tsconfig) | Base TypeScript compiler configurations (`base`, `plugin`, `library`). | — |
| [`@packages/types`](packages/types) | Domain types, `Result<T, E>` contracts, `IFileMeta`, command and hotkey interfaces. | 0% runtime deps |
| [`@packages/ports`](packages/ports) | Hexagonal architecture ports (`IVaultPort`, `ICommandPort`, `ISettingsPort`, `INoticePort`, `IClipboardPort`). | `@packages/types` |
| [`@packages/core`](packages/core) | Pure domain logic: Markdown block/fence parsing, path handling, settings validation. 100% unit tests. | `@packages/types` |
| [`@packages/adapters`](packages/adapters) | Adapters for the Obsidian API and browser environment implementing the port contracts. | `obsidian`, `@packages/ports`, `@packages/types` |
| [`@packages/obsidian-utils`](packages/obsidian-utils) | Utilities for working with Markdown and MetadataCache in Obsidian. | 0% DOM/Obsidian runtime |
| [`@packages/ui`](packages/ui) | Shared UI components (`Badge`, `Modal`, `Setting`, Split-Editor, CodeEditor) and global theme CSS tokens. | `obsidian`, `@packages/ports` |

---

## 🔌 Plugin Family (`plugins/*`)

Each plugin is an independent module with its own `manifest.json`, `versions.json` history, unit tests and downstream satellite:

| Plugin | Purpose | Code block tag | Satellite repository |
|---|---|---|---|
| [`html-renderer`](plugins/html-renderer) | Isolated rendering of HTML, CSS and JavaScript inside an iframe sandbox with theme support. | ```` ```html-renderer ```` | `obsidian-html-renderer` |
| [`snippet-renderer`](plugins/snippet-renderer) | Interactive widget for script templates with dynamic variable substitution and live preview. | ```` ```snippet-renderer ```` | `obsidian-snippet-renderer` |
| [`tabs-renderer`](plugins/tabs-renderer) | Tabs for structuring notes, a CodeMirror 6 modal tab editor, Drag-and-Drop and cache. | ```` ```tabs ```` / ```` ```tabs-renderer ```` | `obsidian-tabs-renderer` |

---

## 🛠️ Toolchain Commands

```bash
# 1. Install dependencies with catalog validation
pnpm install

# 2. Full code quality verification (Biome + Typecheck + Test + Build)
pnpm check

# 3. Biome linting and auto-formatting
pnpm lint && pnpm format

# 4. Strict type checking across all packages and plugins
pnpm typecheck

# 5. Run pure Vitest unit tests in Node.js
pnpm test

# 6. Build all plugins via Turborepo and esbuild
pnpm build

# 7. Development mode with watch build and auto-linking
pnpm dev

# 8. Create cross-platform symlinks into the .vault/ test vault
pnpm vault:link

# 9. Create a changeset for accumulated changes
pnpm change

# 10. Version bump, manifest.json / versions.json sync and pnpm lock
pnpm version:bump

# 11. CLI merge of the release PR via GitHub CLI and pull into local main
pnpm release:merge

# 12. Build and deliver release artifacts to downstream satellites
pnpm release

# 13. Pack a third-party reference plugin into a Markdown snapshot via Repomix
pnpm ai:context <plugin-name>

# 14. Pack all references from reference/
pnpm ai:context:all
```

---

## 🧠 AI Architecture and Context (Antigravity 2.0 & OpenViking)

The monorepo is optimized for a tandem of **Gemini Pro (Orchestrator)** and **Gemini Flash (Execution and verification)**:

* **`.agents/` directory hierarchy** (the directory ends with `s`; the `.agent/` directory is abolished):
  * `.agents/rules/` — granular rules with selective glob triggers (architecture invariants, Biome standards, complexity limits).
  * `.agents/skills/` — specialized skills (`obsidian-architect`, `complexity-guard`, `biome-refactor`, `reference-migrator`, `semver-changeset`, `subagent-driven-development`, etc.).
  * `.agents/agents/` — role-based subagent specifications (`executor.md`, `verifier.md`, `researcher.md`, `reviewer.md`).
  * `.agents/workflows/` — regulated scenarios via slash commands (`/new-plugin`, `/refactor-reference`, `/verify`, `/prepare-release`).
  * `.agents/mcp.json` — MCP server configuration (`fetch` for reading up-to-date Obsidian API documentation).
* **OpenViking protocol:**
  * **L0 (Mental map):** [`.agents/knowledge/L0_index.json`](.agents/knowledge/L0_index.json).
  * **L1 (Subsystems):** [`.agents/knowledge/subsystems/*.md`](.agents/knowledge/subsystems).
  * **L2 (ADR and CLI):** [`.agents/knowledge/adr/`](.agents/knowledge/adr) and [`.agents/knowledge/cli/commands.md`](.agents/knowledge/cli/commands.md).
  * **Synchronization:** `sync-knowledge .` to refresh subsystem documentation.

---

## 📁 Monorepo Structure

```
.
├── .agents/                      # Antigravity 2.0 and OpenViking AI context
│   ├── agents/                   # Subagent specifications (executor, verifier, etc.)
│   ├── knowledge/                # OpenViking knowledge base (L0, L1, L2)
│   ├── mcp.json                  # MCP server configuration (fetch)
│   ├── rules/                    # Granular rules for the context window
│   ├── skills/                   # On-demand skills and procedures
│   └── workflows/                # Executable scenarios (/verify, /new-plugin, etc.)
├── .changeset/                   # Configuration and accumulated changesets
├── .github/                      # GitHub Actions CI/CD pipelines
│   └── workflows/
│       ├── ci.yml                # PR pipeline: Biome, Typecheck, Vitest, Build
│       └── release.yml           # Release pipeline: Version PR and Downstream Deploy
├── .vault/                       # Local Obsidian vault (in .gitignore)
├── packages/                     # Shared TS libraries (Direct TS Source)
│   ├── adapters/                 # @packages/adapters: port adapters for the Obsidian API
│   ├── core/                     # @packages/core: pure domain logic and parsers
│   ├── obsidian-utils/           # @packages/obsidian-utils: Obsidian domain utilities
│   ├── ports/                    # @packages/ports: hexagonal architecture ports
│   ├── tsconfig/                 # @packages/tsconfig: base tsc settings
│   ├── types/                    # @packages/types: domain interfaces and Result<T, E>
│   └── ui/                       # @packages/ui: UI components and theme styles
├── plugins/                      # Obsidian plugin family
│   ├── html-renderer/            # HTML Renderer (isolated iframe)
│   ├── snippet-renderer/         # Snippet Renderer (interactive templates)
│   └── tabs-renderer/            # Tabs Renderer (note organization in tabs)
├── reference/                    # Third-party plugin reference snapshots (in .gitignore)
├── scripts/                      # TypeScript utility toolchain (tsx)
│   ├── build.ts                  # Centralized esbuild bundler
│   ├── deploy-downstream.ts      # Artifact delivery to satellite repositories
│   ├── generate-ai-context.ts    # Source packing via Repomix
│   ├── link-vault.ts             # Cross-platform symlink linking into .vault
│   ├── merge-release-pr.ts       # Automatic CLI merge of the release PR via gh
│   └── sync-versions.ts          # Version synchronization in manifests
├── .npmrc                        # save-exact=true, version isolation
├── AGENTS.md                     # General AI agent regulations for the monorepo
├── biome.json                    # Unified Biome linter and formatter configuration
├── LICENSE                       # Root MIT license (SSOT)
├── mise.toml                     # Local environment version declaration
├── package.json                  # Root manifest with toolchain scripts
├── pnpm-workspace.yaml           # Workspace declaration and Pnpm Catalogs
├── repomix.config.json           # Context packing configuration
├── SPEC.md                       # Full general monorepo specification
├── turbo.json                    # Granular Turborepo cache configuration
└── vitest.config.ts              # Pure Vitest tests configuration
```
