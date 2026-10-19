---
name: refactor-reference
description: "Dissect and port a third-party Obsidian plugin reference from reference/ directory into modern clean monorepo architecture. Use when adopting, porting, or rebuilding third-party plugins or when invoked via /refactor-reference."
---

# Refactor Reference Skill (/refactor-reference)

1. Check for `reference/<target>-context.md` (or run `pnpm ai:context <target>`).
2. Audit the code with Gemini Pro (identify God classes and outdated libraries).
3. Produce an Implementation Plan.
4. Create the plugin with the `/new-plugin` command.
5. Move the logic into `utils` (+tests) -> `services` -> `ui` -> `main.ts`.
6. Clean up via `complexity-guard` and `biome-refactor`.
7. Finalize with `pnpm check`.
