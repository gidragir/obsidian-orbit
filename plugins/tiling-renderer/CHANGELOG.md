# tiling-renderer

## 1.0.2

### Patch Changes

- c6c134f: Make tab drag-and-drop reliable (enabled by default, sortable semantics, stable active tab) and move drag-and-drop logic to a shared controller reused by tiling panels

## 1.0.1

### Patch Changes

- Standardize settings search aliases and author metadata to gidragir

## 1.0.0

### Major Changes

- Initial release of Tiling Renderer plugin (v1.0.0):
  - Dynamic Hyprland / Niri style tiled window layout for notes split by `***`
  - Two-tier directional focus and panel movement navigation (`up`, `down`, `left`, `right`)
  - Directional drag-and-drop with 2D drop zones (split left/right/top/bottom or swap)
  - Proportional splitter resizing with persisted layout tree state
  - Dual Preview/Edit mode with syntax-highlighted CodeMirror 6 inline editor
  - Ports & Adapters architecture with debounced file sync and declarative settings API (Obsidian 1.13+)
