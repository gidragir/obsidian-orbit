---
trigger: model_decision
description: "Semantic versioning bump rules, Changeset artifact generation, and release automation for Obsidian plugins."
---

# 50: Changesets & Release Automation

1. **Запрет ручной правки:** Версии в `manifest.json`, `package.json`, `versions.json` вручную не редактируются.
2. **Классификация SemVer:**
   * `major`: Изменение схемы `data.json`, удаление команд.
   * `minor`: Новые команды, новая вкладка настроек, расширение API.
   * `patch`: Баг-фиксы, стили CSS, внутренний рефакторинг.
3. **Хук синхронизации:** `pnpm version:bump` вызывает `scripts/sync-versions.ts`.
4. **Инвариант privatePackages:** Плагины монорепозитория (`plugins/*`) имеют `"private": true`. В `.changeset/config.json` обязателен блок:
   `"privatePackages": { "version": true, "tag": false }`.
5. **CI Permissions & PAT:** 
   * Репозиторий требует `default_workflow_permissions="write"` и `can_approve_pull_request_reviews=true` для создания PR экшеном `@changesets/action`.
   * Секрет `RELEASE_PAT` с правами `repo` должен экспортироваться как `RELEASE_PAT` и `GH_TOKEN` для доставки релизов в сателлиты через `scripts/deploy-downstream.ts`.
