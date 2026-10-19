---
name: biome-refactor
description: "Guides strict TypeScript resolution of Biome violations including noExplicitAny, noEnum, noNonNullAssertion, and noParameterProperties. Use when fixing linter errors, resolving TypeScript type mismatches, or preparing code for CI validation."
---

# Biome & Strict TypeScript Refactoring Skill

1. **Eliminating `any`:** Replace with `unknown` narrowed via Type Guards, or with Generic parameters `<T>`.
2. **Eliminating `enum`:** Replace with `const Object as const` + `typeof Object[keyof typeof Object]`.
3. **Eliminating `!`:** Replace with a check `if (!val) throw new Error(...)` or the `??` operator.
4. **Parameter Properties:** Declare fields explicitly in the class body instead of constructor arguments.
5. **`node:` prefix:** For all Node.js standard library modules.
