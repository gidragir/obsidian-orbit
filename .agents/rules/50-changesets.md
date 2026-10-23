---
trigger: model_decision
description: "Semantic versioning bump rules, Changeset artifact generation, and release automation for Obsidian plugins."
---

# 50: Changesets & Release Automation

1. **No manual edits:** Versions in `manifest.json`, `package.json`, `versions.json` are never edited by hand.
2. **SemVer classification:**
   * `major`: `data.json` schema change, command removal.
   * `minor`: New commands, a new settings tab, API extension.
   * `patch`: Bug fixes, CSS styles, internal refactoring.
3. **Sync hook:** `pnpm version:bump` invokes `scripts/sync-versions.ts`.
4. **privatePackages invariant:** Monorepo plugins (`plugins/*`) have `"private": true`. `.changeset/config.json` must contain the block:
   `"privatePackages": { "version": true, "tag": false }`.
5. **CI Permissions & PAT:**
   * The repository requires `default_workflow_permissions="write"` and `can_approve_pull_request_reviews=true` for the `@changesets/action` action to create PRs.
   * The `RELEASE_PAT` secret with `repo` scope must be exported as `RELEASE_PAT` and `GH_TOKEN` to deliver releases to satellites via `scripts/deploy-downstream.ts`.
6. **End-to-End Release contract (Mandatory Full-Cycle Delivery):**
   * Любой запрос пользователя на «релиз», «выпусти релиз», «сделай релиз» или `/release-plugin` означает **безусловное и исчерпывающее выполнение полного цикла**, необходимого для появления новой версии плагина в GitHub и релизов сателлитов.
   * Агенту категорически запрещено останавливаться на полпути, генерировать только changeset-файл или передавать пользователю команды для ручного ввода в терминал, кроме случаев явной ошибки внешнего сервиса или непреодолимой блокировки инструментов.
   * Полный цикл включает в себя:
     1. Создание Changeset-файла (`.changeset/<plugin>-<bump>.md`).
     2. Верификацию кодовой базы (`pnpm check`: Biome + TS + Vitest + esbuild).
     3. Индексацию изменений и Changeset-файла (`git add`).
     4. Создание Conventional Commit (`git commit -m "chore(release): prepare <plugin> <bump> release"`).
     5. Отправку в удаленный репозиторий (`git push origin main`).
     6. Ожидание или проверку запуска workflow `Release & Downstream Deploy` в GitHub Actions (`gh run list`).
     7. Слияние релизного PR через `pnpm release:merge` (или автоматизацию слияния с последующей публикацией тега и релиза в GitHub сателлита).
   * Конечная точка выполнения задачи: версия официально опубликована в GitHub репозитории/сателлите.
7. **Initial release protocol for a new plugin (v1.0.0 Initial Release):**
   * For a new plugin whose initial version is `1.0.0`, generating a changeset via `pnpm change` is prohibited, to avoid a false bump to `1.1.0`/`2.0.0`.
   * The initial release is formalized by creating `plugins/<id>/CHANGELOG.md` with a `## 1.0.0` heading and a list of key features.
   * `repository.url` in `package.json` must point to the target satellite (`https://github.com/gidragir/obsidian-<id>.git`). If the satellite has not yet been created on GitHub, the deploy script correctly skips the release until the repository is created.
