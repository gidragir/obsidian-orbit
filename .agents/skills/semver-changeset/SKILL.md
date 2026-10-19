---
name: semver-changeset
description: "Determines accurate Semantic Versioning bumps (patch, minor, major) for Obsidian plugins according to settings migration safety and API contracts. Use when creating changesets, documenting PR changes, or preparing a release."
---

# SemVer & Changeset Skill

1. **Version matrix:**
   * `major`: `data.json` schema change, command removal.
   * `minor`: Adding commands, settings, or UI panels.
   * `patch`: Bug fixes in parsers, CSS layout, tests.
2. **Changeset formatting:** An end-user-friendly summary of changes in the file `.changeset/<hash>.md`.
