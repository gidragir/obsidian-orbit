---
trigger: glob
globs: ["**/*.test.ts"]
description: "Enforces pure unit testing standards in Node.js runtime using Vitest. Prohibits DOM emulators, happy-dom, jsdom, and Obsidian runtime mocks."
---

# 40: Pure Unit Testing Standards (Vitest)

1. **Runtime:** Pure Node.js (`environment: 'node'`).
2. **Prohibitions:** No emulators (`happy-dom`, `jsdom`) and no mocks of `App`, `Vault`, `Plugin`.
3. **Scope:** Test Markdown parsers, validators, state machines, data helpers.
4. **Placement:** Next to the pure functions in `src/utils/*.test.ts`.
