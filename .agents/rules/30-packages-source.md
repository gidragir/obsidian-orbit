---
trigger: glob
globs: ["packages/**"]
description: "Guidelines for shared internal packages using the Direct TS Source model, export maps, and peer dependency declarations for obsidian."
---

# 30: Shared Packages Architecture (Direct TS Source)

1. **Model:** No `dist/` directories and no build phase. Export directly: `"exports": { ".": "./src/index.ts" }`.
2. **Obsidian types:** Declared in both `peerDependencies: { "obsidian": "catalog:" }` and `devDependencies: { "obsidian": "catalog:" }`.
3. **Separation:** Pure logic goes in `@packages/obsidian-utils`, shared UI elements in `@packages/ui`.
