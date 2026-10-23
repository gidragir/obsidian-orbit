# General AI Agent Regulations (AGENTS.md)

This document is the main system contract and Single Source of Truth (SSOT) for the autonomous agents of the **Google Antigravity IDE** platform and the **Antigravity 2.0** environment. The document is loaded automatically at session initialization and has the highest priority in any architectural, engineering and procedural decision.

Author: **gidragir**.

## 1. Runtime environment and the Gemini model tandem

Development takes place in a native **Linux (CachyOS / Arch Linux)** environment using a distributed model tandem:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ORCHESTRATOR (Gemini Pro)                           │
│  • Analysis of architectural invariants and monorepo contracts              │
│  • Deep audit of third-party reference plugins from reference/              │
│  • Task decomposition, pattern control (Ports & Adapters, Facade)           │
│  • Code complexity metrics audit (cognitive <= 15, cyclomatic <= 10)        │
│  • Producing Implementation Plan artifacts and architectural plans          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Task delegation and quality control
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     EXECUTION SUBAGENT (Gemini Flash)                       │
│  • Sub-second generation of pure domain functions and Vitest unit tests     │
│  • Implementation of thin Obsidian API adapters (src/main.ts, src/ui/)      │
│  • Autonomous verification cycles in the terminal (pnpm check)              │
│  • Automatic fixing of Biome defects (pnpm lint && pnpm format)             │
│  • Fixing typical TypeScript mismatches without using any and !             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Antigravity 2.0 context system hierarchy
> [!IMPORTANT]
> The `.agents/` directory (with a trailing 's') is the single store for all rules, skills, agents and configurations. Using the `.agent/` directory is prohibited to avoid collisions and empty contexts.

To prevent degradation of model attention, the monorepo context is structured in a five-level scheme with a Progressive Disclosure mechanism:

1. **General context (`AGENTS.md`):** Basic architectural taboos, model roles, complexity metrics and toolchain (always in context).
2. **Granular rules (`.agents/rules/*.md`):** Loaded by declarative triggers:
   * `00-architecture.md` — Always On (monorepo invariants, SSOT, paths).
   * `10-biome-typescript.md` — Glob: `**/*.{ts,tsx,json,css}` (typing and Biome standards).
   * `15-patterns-complexity.md` — Glob: `**/*.{ts,tsx}` (patterns and complexity limits).
   * `20-obsidian-plugins.md` — Glob: `plugins/**` (plugin lifecycle, theme styles).
   * `30-packages-source.md` — Glob: `packages/**` (Direct TS Source model).
   * `40-pure-testing.md` — Glob: `**/*.test.ts` (pure Vitest tests in Node.js).
   * `50-changesets.md` — Model Decision (release operations and SemVer).
3. **Specialized skills (`.agents/skills/*/SKILL.md`):** Loaded dynamically by semantic trigger in `description` or slash command invocation:
   * `obsidian-architect` — Plugin architecture, memory leak prevention, ports and adapters.
   * `complexity-guard` — Reducing cognitive and cyclomatic complexity, refactoring branching.
   * `biome-refactor` — Eliminating `any`, `enum`, non-null assertion `!`, parameter properties.
   * `reference-migrator` — Analyzing Repomix Markdown snapshots and adapting third-party references.
   * `semver-changeset` — Calculating the SemVer increment for Obsidian and formatting changesets.
   * `subagent-driven-development` — Executing implementation plans via isolated subagent roles.
   * `new-plugin` — Scaffolding a new plugin, manifests, tsconfig aliases and pure tests (`/new-plugin`).
   * `refactor-reference` — Auditing third-party Repomix reference snapshots and decomposition (`/refactor-reference`).
   * `verify` — Autonomous verification cycle: `biome check` -> `typecheck` -> `test` -> `build` (`/verify`).
   * `prepare-release` — SemVer increment calculation and changeset generation (`/prepare-release`).
   * `release-plugin` — Delegating pre-compiled release CLI pipelines to a lightweight Flash subagent without re-scanning code (`/release-plugin`).
4. **Role-based subagent catalog (`.agents/agents/*.md`):** Antigravity 2.0 subagent specifications:
   * `executor.md` — Execution subagent (Flash): sub-second coding of the core and Vitest tests.
   * `verifier.md` — Verification subagent (Flash): Biome -> TS -> Vitest -> Turbo cycle.
   * `researcher.md` — Audit subagent (Flash): symbol search and Repomix snapshot analysis.
   * `reviewer.md` — Review subagent (Pro): checking invariants, complexity limits and memory.
   * `release-runner.md` — Release subagent (Flash): zero-scan execution of pre-compiled release CLI pipelines.
5. **MCP context protocol (`.agents/mcp.json`):** An external `fetch` server for retrieving current Obsidian API and CodeMirror 6 documentation.

## 3. Fundamental architectural invariants (Hard taboos)

Every agent action must strictly observe the following constraints:

1. **No upward relative imports (`../../`):**
   * Inside plugins (`plugins/<id>/src/**`), paths that climb out of the module are prohibited.
   * Using `tsconfig.json` aliases is mandatory: `@ui/*`, `@settings/*`, `@services/*`.
   * For shared libraries only the `@packages/*` scope is used.
2. **Direct source import model (Direct TS Source):**
   * Shared packages (`@packages/obsidian-utils`, `@packages/ui`) **have no build phase** and no `dist/` directories.
   * Each plugin's bundler (`esbuild`) inline-compiles pure TypeScript into the final `main.js`.
3. **Pinpoint versioning and Pnpm Catalogs:**
   * Floating ranges (`^`, `~`) are prohibited in `package.json` manifests.
   * Internal links are pinned via `workspace:*`.
   * Third-party libraries are declared in the `catalog:` of `pnpm-workspace.yaml` and consumed as `"catalog:"`.
4. **Pure unit tests (strict ban on DOM and Obsidian mocks):**
   * Connecting browser emulators (`happy-dom`, `jsdom`, `@testing-library`) is prohibited.
   * Creating mocks of the `App`, `Vault`, `Workspace`, `TFile` or `Plugin` classes is prohibited.
   * Only pure domain logic (`src/utils/`, `@packages/obsidian-utils`) is subject to testing in Vitest (`node:test` environment).
5. **Inviolability of the test vault `.vault/`:**
   * Directly modifying files in `.vault/.obsidian/plugins/` is prohibited.
   * Plugin access to the vault is configured exclusively via symlinks with the `pnpm vault:link` script.
6. **Changesets release cycle contract & Full-Cycle End-to-End Delivery:**
   * Manually changing versions in `manifest.json`, `package.json` and `versions.json` is prohibited.
   * Versioning is done via changesets (`pnpm change`) and the `scripts/sync-versions.ts` script.
   * **Mandatory Full-Cycle Delivery:** Any user request for a release («релиз», «выпусти релиз», `/release-plugin`, etc.) contractually requires executing the entire pipeline from end to end until the new version is published on GitHub: changeset generation -> `pnpm check` -> git add/commit -> `git push origin main` -> monitoring CI/CD -> merging the release PR (`pnpm release:merge`) -> publication on GitHub. Stopping halfway or leaving manual CLI instructions is strictly prohibited unless insurmountable environment failures occur.
7. **Mandatory shared styles and UI reuse (`@packages/ui`):**
   * All plugins (`plugins/*`) must declare `"@packages/ui": "workspace:*"` in `package.json` dependencies and import shared styles via `@import '../../../packages/ui/src/styles.css';` on line 1 of `src/styles.css`.
   * Reusing shared classes (`.orbit-badge`, `.orbit-card`, `.orbit-stat-card`, `.orbit-filter-tabs`, `.orbit-empty-state`, `.orbit-control-label`) and native Obsidian theme variables is strictly mandatory to eliminate boilerplate and prevent styling fragmentation across plugins.

## 4. Design patterns and code complexity limits

The project codebase is designed according to Clean Architecture / Hexagonal Architecture standards.

### 4.1 «Ports and Adapters» architectural style
* **Domain core (`src/utils/`, `@packages/obsidian-utils`):**
  * Contains Markdown parsers, math, state machines and business rules.
  * 0% dependencies on `obsidian`, `electron` or the DOM. 100% Vitest unit test coverage.
* **Adapter layer (`src/services/`, `src/ui/`, `src/main.ts`):**
  * Implements interfaces for interacting with the vault (`app.vault`), cache (`app.metadataCache`) and UI (`ItemView`, `Modal`).
  * Contains no algorithmic logic requiring unit tests.

### 4.2 No God classes
* The `main.ts` class is a thin facade adapter for the lifecycle.
* The `onload()` method must not exceed **20–30 lines**. Initialization is extracted into sub-methods: `registerCommands()`, `registerViews()`, `registerEvents()`.
* All note operations are delegated to service classes (`@services/*`).

### 4.3 Normative code complexity thresholds and heuristics
* See the granular rule `.agents/rules/15-patterns-complexity.md`. It includes the cognitive (<= 15) and cyclomatic (<= 10) complexity limits.

## 5. Biome and strict TypeScript typing quality standards
* The codebase is formatted and checked via Biome.
* **Strict taboos:** Complete ban on `any`, `enum`, `!` and Parameter Properties.
* Replacement details, Type Guards and `node:` prefixes are described in `.agents/rules/10-biome-typescript.md`.

## 6. Interaction with external tools via MCP

The **`fetch`** server is configured in `.agents/mcp.json`:
* **Purpose:** Reading current Obsidian API documentation (`docs.obsidian.md`), CodeMirror 6 specifications and changelogs.
* **Context-saving rule:** The agent calls `fetch` only when researching new, previously unknown API methods or to verify type signatures. The tool is not called for trivial methods (`addCommand`, `registerView`).

## 7. Catalog of operational skills & slash commands

Operational skills can be invoked directly or triggered via Slash commands in the Antigravity chat:
* **`/new-plugin` ([`.agents/skills/new-plugin/SKILL.md`](file:///home/gidragir/projects/obsidian-orbit/.agents/skills/new-plugin/SKILL.md)):** Scaffolding a plugin, manifests, tsconfig aliases and pure tests.
* **`/refactor-reference` ([`.agents/skills/refactor-reference/SKILL.md`](file:///home/gidragir/projects/obsidian-orbit/.agents/skills/refactor-reference/SKILL.md)):** Auditing third-party Repomix reference snapshots and decomposition.
* **`/verify` ([`.agents/skills/verify/SKILL.md`](file:///home/gidragir/projects/obsidian-orbit/.agents/skills/verify/SKILL.md)):** Autonomous Gemini Flash cycle: `biome check` -> `typecheck` -> `test` -> `build`. Protected against infinite loops (Max Retries = 3).
* **`/prepare-release` ([`.agents/skills/prepare-release/SKILL.md`](file:///home/gidragir/projects/obsidian-orbit/.agents/skills/prepare-release/SKILL.md)):** SemVer increment calculation and changeset generation.
* **`/release-plugin` ([`.agents/skills/release-plugin/SKILL.md`](file:///home/gidragir/projects/obsidian-orbit/.agents/skills/release-plugin/SKILL.md)):** Zero-scan release execution via lightweight Flash subagent.

## 8. Toolchain console command reference

| Command | Purpose | Agent obligation |
|---|---|---|
| `pnpm check` | Combined run: Biome + Typecheck + Unit Tests + Turbo Build. | **Strictly mandatory** before completing any task. |
| `pnpm biome check .` | Biome linter and formatter check. | For a quick syntax and complexity audit. |
| `pnpm lint && pnpm format` | Automatic Biome style fixes. | When style issues are detected. |
| `pnpm turbo run typecheck` | Strict type checking via the TypeScript compiler. | When modifying interfaces and types. |
| `pnpm turbo run test` | Run Vitest unit tests in the Node.js runtime. | After any edits in `src/utils/` or `@packages/*`. |
| `pnpm turbo run build` | Test build of all plugins via esbuild. | To confirm the integrity of the `main.js` bundles. |
| `pnpm vault:link` | Recreate symbolic links in `.vault/`. | When creating or renaming a plugin. |
| `pnpm change` | Generate a Changesets changeset file. | When preparing functional changes for release. |
| `pnpm release:merge` | Auto-merge the release PR via GitHub CLI and `git pull`. | When performing a release from the console. |
| `pnpm ai:context <name>` | Pack a reference plugin from `reference/` via Repomix. | Before starting to port a third-party plugin. |


---

## 🧠 OpenViking Context Protocol

This repository contains a 3-tier OpenViking knowledge base in `.agents/knowledge/` and rules in `.agents/rules/project_context.md`.
- **L0 (Mental Map):** Call `context_get_subsystems` via `call_mcp_tool`.
- **L1 (Subsystems):** Call `context_get_subsystem` via `call_mcp_tool` before modifying module files.
- **L2 (Code Reference & Drift):** Call `context_pack` and `context_check` via `call_mcp_tool`.
- **Direct File Access:** Strictly prohibited for `.agents/knowledge/**`. Use native `context-init` MCP tools.

## 🗺 Architectural map and navigation (OpenViking L0-L2)

The `obsidian-orbit` project is managed by a three-tier OpenViking knowledge base (L0-L2).
Reading `.agents/knowledge/**` files directly via file-reading tools (`view_file`, `cat`, etc.) is strictly prohibited. All navigation and architecture exploration is performed exclusively through the `context-init` MCP server (MCP-First Protocol).

### ⚡ MCP-First Protocol (context-init)

1. **Overview of all subsystems and project structure (L0):**
   Call `context_get_subsystems`:
   ```json
   {"ServerName": "context-init", "ToolName": "context_get_subsystems", "Arguments": {}}
   ```
2. **Getting a compact L1 card of a specific subsystem:**
   Call `context_get_subsystem` (pass `subsystem_id`):
   ```json
   {"ServerName": "context-init", "ToolName": "context_get_subsystem", "Arguments": {"subsystem_id": "<subsystem_id>"}}
   ```
3. **AST-compressed subsystem code context (without context bloat):**
   Call `context_pack`:
   ```json
   {"ServerName": "context-init", "ToolName": "context_pack", "Arguments": {"subsystem_id": "<subsystem_id>", "compress": true}}
   ```
4. **Architectural drift check before handing in a task:**
   Call `context_check`:
   ```json
   {"ServerName": "context-init", "ToolName": "context_check", "Arguments": {}}
   ```

### 📦 Available subsystems:
- `changeset` (.changeset) — Configuration for managing changes in the project.
- `vault` (.vault) — Contains plugin source files and their configurations.
- `dev-vault` (dev-vault) — Plugin development and testing.
- `adapters` (adapters) — Adapters for interacting with the Obsidian API.
- `core` (core) — The system core, including tile structure and geometry.
- `obsidian-utils` (obsidian-utils) — Utilities for working with Obsidian, such as link parsing and formatting.
- `ports` (ports) — Interfaces for interacting with external systems.
- `tsconfig` (tsconfig) — TypeScript configurations for the project.
- `types` (types) — Types for handling results and errors.
- `ui` (ui) — User interface for editing and interaction.
- `reference` (reference) — Reference information and plugin usage examples.
- `scripts` (scripts) — Scripts for automating build and deployment processes.
- `.changeset` (.changeset) — Module and components of the `.changeset` directory (1 file)
- `.vault` (.vault) — Subsystem `.vault` with key entry points: .vault/.obsidian/plugins/tiling-renderer/src/main.ts, .vault/.obsidian/plugins/tabs-renderer/src/main.ts, .vault/.obsidian/plugins/html-renderer/src/main.ts, .vault/.obsidian/plugins/tabs-renderer/package.json, .vault/.obsidian/plugins/html-renderer/package.json, .vault/.obsidian/plugins/snippet-renderer/package.json, .vault/.obsidian/plugins/tiling-renderer/package.json, .vault/.obsidian/plugins/snippet-renderer/src/main.ts
- `packages_adapters` (Adapters) — Subsystem `packages/adapters` with key entry points: packages/adapters/package.json, packages/adapters/src/index.ts
- `packages_core` (Core) — Subsystem `packages/core` with key entry points: packages/core/package.json, packages/core/src/index.ts
- `packages_obsidian-utils` (Obsidian Utils) — Subsystem `packages/obsidian-utils` with key entry points: packages/obsidian-utils/src/index.ts, packages/obsidian-utils/package.json
- `packages_ports` (Ports) — Subsystem `packages/ports` with key entry points: packages/ports/src/index.ts, packages/ports/package.json
- `packages_tsconfig` (Tsconfig) — Subsystem `packages/tsconfig` with key entry points: packages/tsconfig/package.json
- `packages_types` (Types) — Subsystem `packages/types` with key entry points: packages/types/src/index.ts, packages/types/package.json
- `packages_ui` (Ui) — Subsystem `packages/ui` with key entry points: packages/ui/package.json, packages/ui/src/index.ts
- `plugins_html-renderer` (Html Renderer) — Subsystem `plugins/html-renderer` with key entry points: plugins/html-renderer/src/main.ts, plugins/html-renderer/package.json
- `plugins_snippet-renderer` (Snippet Renderer) — Subsystem `plugins/snippet-renderer` with key entry points: plugins/snippet-renderer/package.json, plugins/snippet-renderer/src/main.ts
- `plugins_tabs-renderer` (Tabs Renderer) — Subsystem `plugins/tabs-renderer` with key entry points: plugins/tabs-renderer/src/main.ts, plugins/tabs-renderer/package.json
- `plugins_tiling-renderer` (Tiling Renderer) — Subsystem `plugins/tiling-renderer` with key entry points: plugins/tiling-renderer/src/main.ts, plugins/tiling-renderer/package.json
- `plugins_vault-renderer` (Vault Renderer) — Subsystem `plugins/vault-renderer` with key entry points: plugins/vault-renderer/src/main.ts, plugins/vault-renderer/package.json
