---
description: "Prepare an Obsidian plugin release. Calculates SemVer increment, generates a Changeset artifact, and creates a Conventional Commit."
---

# Workflow: /prepare-release

1. Проверить статус репозитория: `git status --porcelain`.
2. Рассчитать инкремент SemVer и вызвать `pnpm change` (или создать `.changeset/<hash>.md`).
3. Запустить верификацию: `pnpm check`.
4. Создать Conventional Commit: `feat(<plugin>): ...` или `fix(<plugin>): ...`.
