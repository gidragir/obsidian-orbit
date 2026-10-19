---
trigger: glob
globs: ["**/*.ts", "**/*.tsx", "**/*.json", "**/*.css"]
description: "Strict TypeScript compilation rules, Biome linter invariants, and code formatting standards. Prohibits any, enum, non-null assertions, and parameter properties."
---

# 10: Strict TypeScript & Biome Standards

1. **Formatting:** Single quotes `'`, no semicolons, 2 spaces, lines up to 100 characters.
2. **Biome taboos:**
   * No `any` (`noExplicitAny`): replace with `unknown` plus Type Guards or Generics.
   * No `enum` (`noEnum`): replace with a const object + union type.
   * No `!` (`noNonNullAssertion`): replace with Guard Clauses or `??`.
   * No `noParameterProperties`: declare properties explicitly in the class body.
   * Node.js system modules strictly with the `node:` prefix.
