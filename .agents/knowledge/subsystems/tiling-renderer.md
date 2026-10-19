# Subsystem: tiling-renderer (L1)

> **Identifier:** `tiling-renderer`
> **Tags:** plugins, tiling, obsidian, hyprland | **Size:** ~12000 BPE tokens

## 🎯 Purpose and role
Obsidian plugin for tiled display of Markdown notes (Tiling Layout) with 2D splitting, Drag & Drop, and Hyprland / i3wm-style navigation and resizing.

## 📁 Entry points and file structure

| File | Description |
| :--- | :--- |
| `plugins/tiling-renderer/package.json` | Plugin package manifest |
| `plugins/tiling-renderer/manifest.json` | Obsidian plugin manifest |
| `plugins/tiling-renderer/src/main.ts` | Plugin entry point, Hyprland navigation commands, view registration |
| `plugins/tiling-renderer/src/ui/tiling-view.ts` | Main interactive view of the tiling layout (`ItemView`) |
| `plugins/tiling-renderer/src/ui/tiling-panel-renderer.ts` | Renderer of the DOM tree of branches, panels and split/close actions |
| `plugins/tiling-renderer/src/ui/panel-dnd-controller.ts` | Panel drag-and-drop controller |
| `plugins/tiling-renderer/src/services/tiling-sync-service.ts` | Domain manager of note sections (`TilingDocumentStore`) |
| `plugins/tiling-renderer/src/settings/types.ts` | Settings interface and `DEFAULT_SETTINGS` defaults |
| `plugins/tiling-renderer/src/settings/settings-tab.ts` | Declarative plugin settings panel (`DeclarativePluginSettingTab`) |
| `plugins/tiling-renderer/src/styles.css` | Plugin styles importing shared `@packages/ui` variables |

## 🔑 Key contract and dependencies
- `@packages/core`: `TileNode` tree structure, split geometry, normalized rectangles and spatial navigation.
- `@packages/adapters`: `DebouncedWorkspaceFileAdapter` for deferred saving and synchronization with open `MarkdownView`s, `DeclarativePluginSettingTab` for settings.
- `@packages/ui`: `CodeEditor` for editing Markdown in panels, `attachSplitterDrag` for splitters, `attachInternalLinkHandler` for links, `computeDropZone2D` for DND drop zones.
- `@packages/ports`: `TilingLayoutHost`, document section interfaces `DocumentSection`.

## 🧪 Running and testing
```bash
rtk pnpm --filter obsidian-tiling-renderer build
```
