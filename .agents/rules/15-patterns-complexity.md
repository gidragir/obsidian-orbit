---
trigger: glob
globs: ["**/*.ts", "**/*.tsx", "*.ts"]
description: "Design patterns and architectural limits on code complexity. Enforces cognitive complexity <= 15, cyclomatic complexity <= 10, nesting depth <= 3, and SRP."
---

# 15: Design Patterns & Complexity Control

1. **Architectural pattern:** Ports and Adapters. The domain core (`src/utils/`, `@packages/obsidian-utils`) has 0% dependencies on the DOM and Obsidian API and 100% Vitest test coverage.
2. **No God classes:** `main.ts` is a thin adapter; `onload()` is at most 20–30 lines.
3. **Complexity limits:**
   * Cognitive complexity: <= 15 per function.
   * Cyclomatic complexity: <= 10 per function (up to 15 for mappings).
   * Block nesting depth: <= 3.
   * Function size: <= 40 lines.
4. **Heuristics:** Guard Clauses, Strategy Lookup Maps, Expressive Predicates.
