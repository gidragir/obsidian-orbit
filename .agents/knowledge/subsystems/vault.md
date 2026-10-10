# Подсистема: .vault (L1)

> **Идентификатор:** `vault`
> **Теги:** plugins, source-code | **Объем:** ~123944 токенов BPE

## 🎯 Назначение и роль
Содержит исходные файлы плагинов и их конфигурации.

## 📁 Точки входа и структура файлов

| Файл | Строк | Статус |
| :--- | :--- | :--- |
| `.vault/.obsidian/plugins/tiling-renderer/src/main.ts` | 314 | ⭐ Точка входа |
| `.vault/.obsidian/plugins/tabs-renderer/src/main.ts` | 70 | ⭐ Точка входа |
| `.vault/.obsidian/plugins/html-renderer/src/main.ts` | 48 | ⭐ Точка входа |
| `.vault/.obsidian/plugins/tabs-renderer/package.json` | 37 | ⭐ Точка входа |
| `.vault/.obsidian/plugins/tiling-renderer/package.json` | 37 | ⭐ Точка входа |
| `.vault/.obsidian/plugins/html-renderer/package.json` | 32 | ⭐ Точка входа |
| `.vault/.obsidian/plugins/snippet-renderer/package.json` | 31 | ⭐ Точка входа |
| `.vault/.obsidian/plugins/snippet-renderer/src/main.ts` | 19 | ⭐ Точка входа |
| `.vault/.obsidian/workspace.json` | 215 | Исходный код |
| `.vault/Test tiling renderer.md` | 208 | Исходный код |
| `.vault/.obsidian/plugins/tiling-renderer/data.json` | 0 | Удален |
| `.vault/.obsidian/hotkeys.json` | 126 | Исходный код |
| `.vault/.obsidian/plugins/html-renderer/main.js` | 91 | Исходный код |
| `.vault/.obsidian/plugins/html-renderer/README.md` | 62 | Исходный код |
| `.vault/.obsidian/plugins/snippet-renderer/README.md` | 44 | Исходный код |

## 🧪 Запуск и тестирование
```bash
rtk pnpm test
```

## 🛠️ Обновления и изменения

### Плагин `tiling-renderer`
- **Удален файл:** `plugins/tiling-renderer/data.json`
- **Обновлен `package.json`:** Удалены зависимости `@codemirror/commands`, `@codemirror/lang-markdown`, `@codemirror/language`, `@codemirror/state`, `@codemirror/view`, `@packages/obsidian-utils`, `@packages/types`.
- **Обновлен `src/main.ts`:** Добавлены методы для регистрации команд навигации, перемещения и изменения размеров окон (`registerHyprlandNavigationCommands`, `registerHyprlandMoveCommands`, `registerHyprlandResizeCommands`, `registerHyprlandWindowCommands`). Метод `onunload` теперь пустой.
- **Обновлен `src/services/tiling-sync-service.ts`:** Метод конструктора теперь принимает либо число, либо булево значение для настройки синхронизации текста.
- **Обновлен `src/settings/settings-tab.ts`:** Класс наследуется от `DeclarativePluginSettingTab` из `@packages/adapters`.

### Дополнительные изменения
- **Добавлены методы в `src/main.ts`:** Методы `registerBasicCommands`, `registerHyprlandNavigationCommands`, `registerHyprlandMoveCommands`, `registerHyprlandResizeCommands`, `registerHyprlandWindowCommands`.
- **Обновлен `src/services/tiling-sync-service.ts`:** Добавлены комментарии и изменен конструктор для поддержки булевого значения.
- **Обновлен `src/settings/settings-tab.ts`:** Использование `DeclarativePluginSettingTab` для настройки табов настроек.

# Recent Git Changes:

--- Diff for plugins/tiling-renderer/data.json ---
diff --git a/plugins/tiling-renderer/data.json b/plugins/tiling-renderer/data.json
deleted file mode 100644
index 7c4eec1..0000000
--- a/plugins/tiling-renderer/data.json
+++ /dev/null
@@ -1,121 +0,0 @@
-{
-  "masterRatio": 0.6,
-  "frontmatterKey": "orbit-tiling",
-  "debounceMs": 500,
-  "panelGap": 2,
-  "syncTextOrder": false,
-  "fileLayouts": {
-    "Тест.md": {
-      "tree": {
-        "type": "branch",
-        "id": "branch-1791549264308-628",
-        "direction": "column",
-        "weight": 1,
-        "children": [
-          {
-            "type": "branch",
-            "id": "branch-1791550123163-798",
-            "direction": "row",
-            "weight": 1,
-            "children": [
-              {
-                "type": "leaf",
-                "id": "leaf-0",
-                "sectionIndex": 0,
-                "weight": 1
-              },
-              {
-                "type": "leaf",
-                "id": "leaf-1791550123163",
-                "sectionIndex": 5,
-                "weight": 1
-              }
-            ]
-          },
-          {
-            "type": "branch",
-            "id": "branch-1791550501438-47",
-            "direction": "row",
-            "weight": 1,
-            "children": [
-              {
-                "type": "leaf",
-                "id": "leaf-3",
-                "sectionIndex": 3,
-                "weight": 1.5413662645442217
-              },
-              {
-                "type": "leaf",
-      
--- Diff for plugins/tiling-renderer/package.json ---
diff --git a/plugins/tiling-renderer/package.json b/plugins/tiling-renderer/package.json
index 71b6b82..2e7b8d1 100644
--- a/plugins/tiling-renderer/package.json
+++ b/plugins/tiling-renderer/package.json
@@ -14,16 +14,9 @@
     "typecheck": "tsc --noEmit"
   },
   "dependencies": {
-    "@codemirror/commands": "catalog:",
-    "@codemirror/lang-markdown": "catalog:",
-    "@codemirror/language": "catalog:",
-    "@codemirror/state": "catalog:",
-    "@codemirror/view": "catalog:",
     "@packages/adapters": "workspace:*",
     "@packages/core": "workspace:*",
-    "@packages/obsidian-utils": "workspace:*",
     "@packages/ports": "workspace:*",
-    "@packages/types": "workspace:*",
     "@packages/ui": "workspace:*"
   },
   "devDependencies": {
--- Diff for plugins/tiling-renderer/src/main.ts ---
diff --git a/plugins/tiling-renderer/src/main.ts b/plugins/tiling-renderer/src/main.ts
index 49c9d09..1399ca4 100644
--- a/plugins/tiling-renderer/src/main.ts
+++ b/plugins/tiling-renderer/src/main.ts
@@ -19,9 +19,7 @@ export default class TilingRendererPlugin extends Plugin implements TilingLayout
     this.registerSettings()
   }
 
-  onunload(): void {
-    this.syncService.dispose()
-  }
+  onunload(): void {}
 
   getSettings(): TilingSettings {
     return this.settings
@@ -72,6 +70,14 @@ export default class TilingRendererPlugin extends Plugin implements TilingLayout
   }
 
   private registerCommands(): void {
+    this.registerBasicCommands()
+    this.registerHyprlandNavigationCommands()
+    this.registerHyprlandMoveCommands()
+    this.registerHyprlandResizeCommands()
+    this.registerHyprlandWindowCommands()
+  }
+
+  private registerBasicCommands(): void {
     this.addCommand({
       id: 'open-current-note-tiling',
       name: 'Tiling renderer: Open current note in tiling view',
@@ -99,6 +105,144 @@ export default class TilingRendererPlugin extends Plugin implements TilingLayout
     })
   }
 
+  private registerHyprlandNavigationCommands(): void {
+    const directions: ReadonlyArray<{
+      id: string
+      name: string
+      dir: 'left' | 'right' | 'up' | 'down'
+    }> = [
