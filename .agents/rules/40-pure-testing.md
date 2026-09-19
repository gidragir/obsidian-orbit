---
trigger: glob
globs: ["**/*.test.ts"]
description: "Enforces pure unit testing standards in Node.js runtime using Vitest. Prohibits DOM emulators, happy-dom, jsdom, and Obsidian runtime mocks."
---

# 40: Pure Unit Testing Standards (Vitest)

1. **Рантайм:** Чистый Node.js (`environment: 'node'`).
2. **Запреты:** Никаких эмуляторов (`happy-dom`, `jsdom`) и моков `App`, `Vault`, `Plugin`.
3. **Область:** Тестируются парсеры Markdown, валидаторы, стейт-машины, хелперы данных.
4. **Размещение:** Рядом с чистыми функциями в `src/utils/*.test.ts`.
