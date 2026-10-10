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
6. **Сквозной контракт команды «Релиз» (End-to-End Release):**
   * Запрос на «релиз / выпуск версии» означает полный цикл: инкремент SemVer + обновление `CHANGELOG.md` -> верификация `pnpm check` -> Conventional Commit -> `git push origin main` -> верификация запуска релизных workflows (`Release & Downstream Deploy`) в GitHub Actions. Не допускается оставлять релизные изменения незапушенными.
7. **Протокол первичного релиза нового плагина (v1.0.0 Initial Release):**
   * Для нового плагина, версия которого изначально равна `1.0.0`, генерация ченджсета через `pnpm change` запрещена во избежание ложного бампа до `1.1.0`/`2.0.0`.
   * Первичный релиз оформляется созданием `plugins/<id>/CHANGELOG.md` с заголовком `## 1.0.0` и списком ключевых возможностей.
   * `repository.url` в `package.json` обязан указывать на целевой сателлит (`https://github.com/gidragir/obsidian-<id>.git`). Если сателлит еще не создан на GitHub, деплой-скрипт корректно пропускает релиз до момента создания репозитория.
