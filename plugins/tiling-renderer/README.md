# Tiling Renderer for Obsidian

Tiled window management layout (Hyprland / Niri style) for large Obsidian notes split by `***`.

## Features

- **Dynamic Tiling Grid:** Automatically splits notes by `***` into arbitrary nested columns and rows.
- **Directional Drag-and-Drop:** Intuitive reordering and nesting via drop zones (top, bottom, left, right, center swap).
- **Proportional Resizing:** Interactive splitters with persisted column and row weight ratios.
- **Native Markdown Preview:** Reads notes with full Obsidian markdown rendering, callouts, math, and internal link navigation.
- **In-place Editing:** Seamlessly switch individual panels between preview and CodeMirror 6 edit mode via button or double-click.
- **Live Bidirectional Sync:** Debounced auto-save directly updating the underlying markdown document.

## Usage

1. In any markdown note, separate sections with `***`:
   ```markdown
   Section 1 Content
   ***
   Section 2 Content
   ***
   Section 3 Content
   ```
2. Open the command palette (`Ctrl/Cmd + P`) and run:
   `Tiling renderer: Open current note in tiling view`

## License

MIT © [Obsidian Orbit](https://github.com/gidragir/obsidian-orbit)
