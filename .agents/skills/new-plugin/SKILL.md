---
name: new-plugin
description: "Scaffold a new Obsidian plugin adhering to monorepo architecture, Ports & Adapters, and strict Biome standards. Use when creating a new plugin or when invoked via /new-plugin."
---

# New Plugin Skill (/new-plugin)

1. Получить `id`, `name`, `description` плагина.
2. Создать директории `plugins/<id>/src/{ui,settings,services,utils}`.
3. Создать `manifest.json`, `versions.json`, `package.json`, `tsconfig.json`.
4. Сгенерировать тонкий `src/main.ts` и чистую функцию с тестом `src/utils/parser.test.ts`.
5. Выполнить `pnpm vault:link` и верифицировать сборку через `pnpm check`.
