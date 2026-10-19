---
trigger: always_on
description: "Core architectural invariants of the Obsidian plugins monorepo. Enforces Direct TS Source, strict path aliases, Zero-copy symlinks, and Ports & Adapters separation."
---

# 00: Core Monorepo Architecture Invariants

1. **Single Source of Truth (SSOT):** All development happens in this monorepo. Satellites are downstream mirrors only.
2. **Direct TS Source:** `@packages/*` packages have no `dist/` build phase. Pure TS sources are imported.
3. **Pinpoint versioning:** `^` and `~` are prohibited. Packages are linked via `workspace:*`, dependencies via `catalog:`.
4. **No upward relative imports:** `../../` is prohibited inside plugins. Use `@ui/*`, `@settings/*`, `@services/*` and `@packages/*`.
5. **Inviolability of `.vault/`:** Direct edits are prohibited. Access only via `pnpm vault:link`.
6. **Strict accuracy of `package.json` manifest dependencies:** The manifest of every plugin and package must declare in `dependencies` and `devDependencies` only packages that are actually imported. Fake or unused dependencies ("dead weight") are prohibited.
7. **Isolation of names and branding of standalone plugins:** In standalone plugins (`plugins/*`), their manifests, code, styles, tests and documentation, mentioning internal monorepo identifiers (`obsidian-orbit`, `orbit`) is strictly prohibited. Each plugin must be fully self-contained for independent publication.
8. **Authorship:** The author of all packages, plugins, manifests and licenses is `gidragir`.
9. **Shared UI & Styles Invariant:** All standalone plugins (`plugins/*`) must declare `"@packages/ui": "workspace:*"` in their `package.json` dependencies and import shared styles via `@import '../../../packages/ui/src/styles.css';` on line 1 of `src/styles.css`. Writing redundant CSS rules for components already provided by `@packages/ui` (cards, badges, segmented tabs, stat cards, empty states, labels) is strictly prohibited — reuse shared tokens and classes across all plugins.
