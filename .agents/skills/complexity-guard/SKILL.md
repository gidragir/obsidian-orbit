---
name: complexity-guard
description: "Audits and refactors complex TypeScript functions exceeding cognitive complexity 15, cyclomatic complexity 10, or nesting depth 3. Use when breaking down God classes, optimizing branching logic, or refactoring legacy methods."
---

# Complexity Guard Skill

1. **Thresholds:** Cognitive complexity <= 15, cyclomatic <= 10, nesting <= 3, lines <= 40.
2. **Guard Clauses:** Early inverted returns `if (!file) return;` instead of cascading nesting.
3. **Strategy Lookup Map:** Typed dictionaries `Record<Key, Handler>` instead of bulky `switch` statements.
4. **Expressive Predicates:** Extract compound boolean expressions into pure predicate functions (`isMarkdownTable()`).
