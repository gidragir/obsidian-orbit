---
name: new-plugin
description: "Scaffold a new Obsidian plugin adhering to monorepo architecture, Ports & Adapters, and strict Biome standards. Use when creating a new plugin or when invoked via /new-plugin."
---

# New Plugin Skill (/new-plugin)

1. Get the plugin `id`, `name`, `description`.
2. Create the directories `plugins/<id>/src/{ui,settings,services,utils}`.
3. Create `manifest.json` (with `"author": "gidragir"`), `versions.json`, `tsconfig.json`.
4. Generate `package.json` (with `"author": "gidragir"`) declaring `"@packages/ui": "workspace:*"` in `dependencies` and only packages actually used.
5. Create `src/styles.css` with the mandatory first line `@import '../../../packages/ui/src/styles.css';`. Reuse shared classes (`.orbit-badge`, `.orbit-card`, `.orbit-stats-grid`, `.orbit-stat-card`, `.orbit-filter-tabs`, `.orbit-empty-state`, `.orbit-control-label`) and native Obsidian theme variables without duplicating base component styles.
6. Generate a base `settings/settings-tab.ts` based on `DeclarativePluginSettingTab` from `@packages/adapters`.
7. Generate a thin `src/main.ts` and a pure function with a test `src/utils/parser.test.ts`.
8. Make sure no `data.json` files are in the git index (`plugins/**/data.json`).
9. Run `pnpm vault:link` and verify the build via `pnpm check`.
