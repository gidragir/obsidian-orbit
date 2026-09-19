---
name: biome-refactor
description: "Guides strict TypeScript resolution of Biome violations including noExplicitAny, noEnum, noNonNullAssertion, and noParameterProperties. Use when fixing linter errors, resolving TypeScript type mismatches, or preparing code for CI validation."
---

# Biome & Strict TypeScript Refactoring Skill

1. **Устранение `any`:** Замена на `unknown` с сужением типа через Type Guards либо Generic-параметры `<T>`.
2. **Устранение `enum`:** Замена на `const Object as const` + `typeof Object[keyof typeof Object]`.
3. **Устранение `!`:** Замена на проверку `if (!val) throw new Error(...)` или оператор `??`.
4. **Parameter Properties:** Явное объявление полей в теле класса вместо аргументов конструктора.
5. **Префикс `node:`:** Для всех модулей стандартной библиотеки Node.js.
