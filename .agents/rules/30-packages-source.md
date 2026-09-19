---
trigger: glob
globs: ["packages/**"]
description: "Guidelines for shared internal packages using the Direct TS Source model, export maps, and peer dependency declarations for obsidian."
---

# 30: Shared Packages Architecture (Direct TS Source)

1. **Модель:** Без каталогов `dist/` и фазы сборки. Экспорт напрямую `"exports": { ".": "./src/index.ts" }`.
2. **Типы Obsidian:** Объявляются одновременно в `peerDependencies: { "obsidian": "catalog:" }` и `devDependencies: { "obsidian": "catalog:" }`.
3. **Разделение:** Чистая логика — в `@packages/obsidian-utils`, общие UI-элементы — в `@packages/ui`.
