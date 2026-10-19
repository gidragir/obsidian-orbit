# Subsystem: .vault (L1)

> **Identifier:** `vault`
> **Tags:** plugins, source-code | **Size:** ~123944 BPE tokens

## 🎯 Purpose and role
Contains plugin source files and their configurations.

## 📁 Entry points and file structure

| File | Lines | Status |
| :--- | :--- | :--- |
| `.vault/.obsidian/plugins/tiling-renderer/src/main.ts` | 314 | ⭐ Entry point |
| `.vault/.obsidian/plugins/tabs-renderer/src/main.ts` | 70 | ⭐ Entry point |
| `.vault/.obsidian/plugins/html-renderer/src/main.ts` | 48 | ⭐ Entry point |
| `.vault/.obsidian/plugins/tabs-renderer/package.json` | 37 | ⭐ Entry point |
| `.vault/.obsidian/plugins/tiling-renderer/package.json` | 37 | ⭐ Entry point |
| `.vault/.obsidian/plugins/html-renderer/package.json` | 32 | ⭐ Entry point |
| `.vault/.obsidian/plugins/snippet-renderer/package.json` | 31 | ⭐ Entry point |
| `.vault/.obsidian/plugins/snippet-renderer/src/main.ts` | 19 | ⭐ Entry point |
| `.vault/.obsidian/workspace.json` | 215 | Source code |
| `.vault/Test tiling renderer.md` | 208 | Source code |
| `.vault/.obsidian/plugins/tiling-renderer/data.json` | 0 | Deleted |
| `.vault/.obsidian/hotkeys.json` | 126 | Source code |
| `.vault/.obsidian/plugins/html-renderer/main.js` | 91 | Source code |
| `.vault/.obsidian/plugins/html-renderer/README.md` | 62 | Source code |
| `.vault/.obsidian/plugins/snippet-renderer/README.md` | 44 | Source code |

## 🧪 Running and testing
```bash
rtk pnpm test
```

## 🛠️ Updates and changes

### Plugin `tiling-renderer`
- **File deleted:** `plugins/tiling-renderer/data.json`
- **Updated `package.json`:** Removed dependencies `@codemirror/commands`, `@codemirror/lang-markdown`, `@codemirror/language`, `@codemirror/state`, `@codemirror/view`, `@packages/obsidian-utils`, `@packages/types`.
- **Updated `src/main.ts`:** Added methods for registering window navigation, move and resize commands (`registerHyprlandNavigationCommands`, `registerHyprlandMoveCommands`, `registerHyprlandResizeCommands`, `registerHyprlandWindowCommands`). The `onunload` method is now empty.
- **Updated `src/services/tiling-sync-service.ts`:** The constructor now accepts either a number or a boolean value to configure text synchronization.
- **Updated `src/settings/settings-tab.ts`:** The class extends `DeclarativePluginSettingTab` from `@packages/adapters`.

### Additional changes
- **Added methods in `src/main.ts`:** Methods `registerBasicCommands`, `registerHyprlandNavigationCommands`, `registerHyprlandMoveCommands`, `registerHyprlandResizeCommands`, `registerHyprlandWindowCommands`.
- **Updated `src/services/tiling-sync-service.ts`:** Added comments and changed the constructor to support a boolean value.
- **Updated `src/settings/settings-tab.ts`:** Uses `DeclarativePluginSettingTab` to configure settings tabs.

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
-    "Test.md": {
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
