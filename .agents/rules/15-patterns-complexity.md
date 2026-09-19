---
trigger: glob
globs: ["**/*.ts", "**/*.tsx", "*.ts"]
description: "Design patterns and architectural limits on code complexity. Enforces cognitive complexity <= 15, cyclomatic complexity <= 10, nesting depth <= 3, and SRP."
---

# 15: Design Patterns & Complexity Control

1. **Архитектурный шаблон:** Порты и Адаптеры. Доменное ядро (`src/utils/`, `@packages/obsidian-utils`) — 0% зависимостей от DOM и Obsidian API, 100% тесты Vitest.
2. **Запрет God-класса:** `main.ts` — тонкий адаптер, `onload()` не более 20–30 строк.
3. **Лимиты сложности:**
   * Когнитивная сложность: <= 15 на функцию.
   * Цикломатическая сложность: <= 10 на функцию (до 15 для маппингов).
   * Глубина вложенности блоков: <= 3.
   * Размер функции: <= 40 строк.
4. **Эвристики:** Guard Clauses, Strategy Lookup Maps, Expressive Predicates.
