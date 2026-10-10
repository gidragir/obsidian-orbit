---
name: new-plugin
description: "Scaffold a new Obsidian plugin adhering to monorepo architecture, Ports & Adapters, and strict Biome standards. Use when creating a new plugin or when invoked via /new-plugin."
---

# New Plugin Skill (/new-plugin)

1. Получить `id`, `name`, `description` плагина.
2. Создать директории `plugins/<id>/src/{ui,settings,services,utils}`.
3. Создать `manifest.json`, `versions.json`, `tsconfig.json`.
4. Сформировать `package.json` с точным подключением только фактически используемых зависимостей (`@packages/*`).
5. Создать `src/styles.css` с обязательной первой строкой `@import '../../../packages/ui/src/styles.css';`.
6. Сгенерировать базовый `settings/settings-tab.ts` на основе `DeclarativePluginSettingTab` из `@packages/adapters`.
7. Сгенерировать тонкий `src/main.ts` и чистую функцию с тестом `src/utils/parser.test.ts`.
8. Убедиться в отсутствии файлов `data.json` в git-индексе (`plugins/**/data.json`).
9. Выполнить `pnpm vault:link` и верифицировать сборку через `pnpm check`.
