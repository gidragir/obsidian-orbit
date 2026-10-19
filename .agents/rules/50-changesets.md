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
6. **End-to-End Release contract:**
   * A request for a "release / version publication" means the full cycle: SemVer bump + `CHANGELOG.md` update -> `pnpm check` verification -> Conventional Commit -> `git push origin main` -> verifying that the release workflows (`Release & Downstream Deploy`) start in GitHub Actions. Leaving release changes unpushed is not allowed.
7. **Initial release protocol for a new plugin (v1.0.0 Initial Release):**
   * For a new plugin whose initial version is `1.0.0`, generating a changeset via `pnpm change` is prohibited, to avoid a false bump to `1.1.0`/`2.0.0`.
   * The initial release is formalized by creating `plugins/<id>/CHANGELOG.md` with a `## 1.0.0` heading and a list of key features.
   * `repository.url` in `package.json` must point to the target satellite (`https://github.com/gidragir/obsidian-<id>.git`). If the satellite has not yet been created on GitHub, the deploy script correctly skips the release until the repository is created.
