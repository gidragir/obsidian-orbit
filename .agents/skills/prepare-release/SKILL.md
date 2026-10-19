---
name: prepare-release
description: "Prepare an Obsidian plugin release. Calculates SemVer increment, generates a Changeset artifact, and creates a Conventional Commit. Use when preparing a release or when invoked via /prepare-release."
---

# Prepare Release Skill (/prepare-release)

1. Check the repository status: `git status --porcelain`.
2. Determine the release type:
   * **Initial release of a new plugin (v1.0.0):** Do not run `pnpm change`. Verify that the version in `manifest.json`, `package.json` and `versions.json` equals `1.0.0`, and create `plugins/<id>/CHANGELOG.md` with a `## 1.0.0` section.
   * **Increment of an existing plugin:** Calculate the SemVer increment and run `pnpm change` (or create `.changeset/<hash>.md`).
3. Run verification: `pnpm check`.
4. Create a Conventional Commit: `feat(<plugin>): ...` or `fix(<plugin>): ...`.
5. Verify that `repository.url` exists in the plugin's `package.json` and that `README.md` is up to date.
6. Run `git push origin main` to automatically trigger the GitHub Actions `Release & Downstream Deploy`.
7. Check the run status via `rtk gh run list --limit 3` and make sure the build jobs are active.
8. To auto-merge the release PR, use the console command `pnpm release:merge` without going to the GitHub web interface.
