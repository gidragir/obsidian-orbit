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
