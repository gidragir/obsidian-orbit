---
name: prepare-release
description: "Prepare an Obsidian plugin release. Calculates SemVer increment, generates a Changeset artifact, and creates a Conventional Commit. Use when preparing a release or when invoked via /prepare-release."
---

# Prepare Release Skill (/prepare-release)

1. Проверить статус репозитория: `git status --porcelain`.
2. Рассчитать инкремент SemVer и вызвать `pnpm change` (или создать `.changeset/<hash>.md`).
3. Запустить верификацию: `pnpm check`.
4. Создать Conventional Commit: `feat(<plugin>): ...` или `fix(<plugin>): ...`.
5. Проверить наличие `repository.url` в `package.json` плагина и актуальность `README.md`.
6. Выполнить `git push origin main` для автоматического запуска GitHub Actions `Release & Downstream Deploy`.
7. Проверить статус запуска через `rtk gh run list --limit 3` и убедиться, что сборочные jobs активны.
8. Для автоматического мерджа релизного PR использовать консольную команду `pnpm release:merge` без перехода в веб-интерфейс GitHub.
