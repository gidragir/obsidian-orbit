---
name: obsidian-architect
description: "Provides architectural patterns, lifecycle safety contracts, event management, and Ports & Adapters isolation for Obsidian.md plugins and packages. Use when designing new plugins, restructuring plugin internals, or interacting with Obsidian Vault and MetadataCache APIs."
---

# Obsidian Architect Skill

1. **Порты и Адаптеры:** Доменные интерфейсы выносятся в `src/utils/`, адаптеры `app.vault` — в `src/services/`.
2. **Жизненный цикл:** Регистрация всех подписок строго через `this.registerEvent`, `this.registerDomEvent`, `this.registerInterval`.
3. **Тонкий `main.ts`:** Метод `onload()` разгружается в приватные методы `registerCommands()`, `registerViews()`.
4. **Безопасные стили:** Использование нативных CSS-переменных темы Obsidian.
5. **Безопасный DND:** Контроллеры перетаскивания элементов UI используют изолированные MIME-типы (`application/x-*`) и блокируют всплытие событий в текстовые редакторы.
6. **Паттерн Preview / Edit:** При создании тайловых/блочных представлений заметок интерфейс проектируется по двухрежимной модели: чтение через `MarkdownRenderer.render` и редактирование по требованию через CM6 с `syntaxHighlighting`.
