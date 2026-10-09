---
trigger: glob
globs: ["plugins/**"]
description: "Standards for Obsidian plugins lifecycle, DOM event registration, manifest compliance, DND data isolation, and theme-safe CSS variable styling."
---

# 20: Obsidian Plugins Standards & Lifecycle

1. **Точка входа:** Экспорт по умолчанию `export default class MyPlugin extends Plugin`.
2. **Безопасность памяти:** Слушатели событий — только через `this.registerDomEvent`, `this.registerEvent`, таймеры через `this.registerInterval`.
3. **Стилизация:** Никакого хардкода цветов в `src/styles.css`. Только нативные переменные темы (`var(--text-normal)`, `var(--background-primary)`).
4. **Манифест:** `id` строго совпадает с папкой, `minAppVersion >= 1.7.0`, `isDesktopOnly: false`.
5. **Изоляция Drag-and-Drop:** В HTML5 DND запрещено передавать служебные токены/ID в формате `'text/plain'` во избежание авто-вставки браузером и CodeMirror в текстовый буфер под курсором. Использовать только кастомные MIME-типы (`application/x-<plugin>-<entity>`) с вызовом `e.stopPropagation()`.
6. **Отображение заметок:** Кастомные UI-представления секций заметок обязаны использовать нативный `MarkdownRenderer.render` (класс `.markdown-rendered.markdown-preview-view`), поддерживая раздельный режим предпросмотра и редактирования.
