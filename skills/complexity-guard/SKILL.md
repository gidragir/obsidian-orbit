---
name: complexity-guard
description: "Audits and refactors complex TypeScript functions exceeding cognitive complexity 15, cyclomatic complexity 10, or nesting depth 3. Use when breaking down God classes, optimizing branching logic, or refactoring legacy methods."
---

# Complexity Guard Skill

1. **Пороги:** Когнитивная сложность <= 15, цикломатическая <= 10, вложенность <= 3, строки <= 40.
2. **Guard Clauses:** Ранние инвертированные возвраты `if (!file) return;` вместо каскадных вложений.
3. **Strategy Lookup Map:** Типизированные словари `Record<Key, Handler>` вместо громоздких `switch`.
4. **Expressive Predicates:** Вынос составных булевых выражений в чистые функции-предикаты (`isMarkdownTable()`).
