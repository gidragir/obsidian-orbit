---
name: semver-changeset
description: "Determines accurate Semantic Versioning bumps (patch, minor, major) for Obsidian plugins according to settings migration safety and API contracts. Use when creating changesets, documenting PR changes, or preparing a release."
---

# SemVer & Changeset Skill

1. **Матрица версий:**
   * `major`: Смена схемы `data.json`, удаление команд.
   * `minor`: Добавление команд, настроек или UI-панелей.
   * `patch`: Баг-фиксы парсеров, верстки CSS, тестов.
2. **Оформление ченджсета:** Понятное для конечного пользователя резюме изменений в файле `.changeset/<hash>.md`.
