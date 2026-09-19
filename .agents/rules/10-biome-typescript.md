---
trigger: glob
globs: ["**/*.ts", "**/*.tsx", "**/*.json", "**/*.css"]
description: "Strict TypeScript compilation rules, Biome linter invariants, and code formatting standards. Prohibits any, enum, non-null assertions, and parameter properties."
---

# 10: Strict TypeScript & Biome Standards

1. **Форматирование:** Одинарные кавычки `'`, без точек с запятой, 2 пробела, строка до 100 символов.
2. **Табу Biome:**
   * Запрет `any` (`noExplicitAny`): замена на `unknown` с Type Guards или Generics.
   * Запрет `enum` (`noEnum`): замена на const object + union type.
   * Запрет `!` (`noNonNullAssertion`): замена на Guard Clauses или `??`.
   * Запрет `noParameterProperties`: объявлять свойства явно в теле класса.
   * Системные модули Node.js строго с префиксом `node:`.
