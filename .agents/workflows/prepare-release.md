---
description: "Prepare an Obsidian plugin release. Calculates SemVer increment, generates a Changeset artifact, and creates a Conventional Commit."
---

# Workflow: /prepare-release

1. Check the repository status: `git status --porcelain`.
2. Calculate the SemVer increment and run `pnpm change` (or create `.changeset/<hash>.md`).
3. Run verification: `pnpm check`.
4. Create a Conventional Commit: `feat(<plugin>): ...` or `fix(<plugin>): ...`.
