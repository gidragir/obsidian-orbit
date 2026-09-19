---
trigger: glob
globs: ["plugins/**"]
description: "Standards for Obsidian plugins lifecycle, DOM event registration, manifest compliance, and theme-safe CSS variable styling."
---

# 20: Obsidian Plugins Standards & Lifecycle

1. **Точка входа:** Экспорт по умолчанию `export default class MyPlugin extends Plugin`.
2. **Безопасность памяти:** Слушатели событий — только через `this.registerDomEvent`, `this.registerEvent`, таймеры через `this.registerInterval`.
3. **Стилизация:** Никакого хардкода цветов в `src/styles.css`. Только нативные переменные темы (`var(--text-normal)`, `var(--background-primary)`).
4. **Манифест:** `id` строго совпадает с папкой, `minAppVersion >= 1.7.0`, `isDesktopOnly: false`.
