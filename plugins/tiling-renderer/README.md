# Tiling Renderer for Obsidian

[![Part of Obsidian Orbit](https://img.shields.io/badge/Monorepo-Obsidian%20Orbit-7C3AED?logo=orbit)](https://github.com/gidragir/obsidian-orbit)
[![Obsidian Plugin](https://img.shields.io/badge/Obsidian-Community%20Plugin-7C3AED?logo=obsidian&logoColor=white)](https://obsidian.md)
[![GitHub Repository](https://img.shields.io/badge/GitHub-obsidian--tiling--renderer-blue?logo=github)](https://github.com/gidragir/obsidian-tiling-renderer)
[![Latest Release](https://img.shields.io/github/v/release/gidragir/obsidian-tiling-renderer?label=Release)](https://github.com/gidragir/obsidian-tiling-renderer/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> 🪐 **Monorepo:** Developed and maintained as part of [Obsidian Orbit](https://github.com/gidragir/obsidian-orbit).  
> 📦 **Standalone Satellite Repository:** [gidragir/obsidian-tiling-renderer](https://github.com/gidragir/obsidian-tiling-renderer)

Hyprland and Niri style dynamic tiled window management layout for large Obsidian notes partitioned by `***`.

---

## ✨ Features

- **Dynamic Tiling Grid:** Automatically splits notes by `***` (Markdown horizontal rules) into arbitrary nested columns and rows.
- **Directional Drag-and-Drop:** Intuitive reordering and nesting via visual drop zones (top, bottom, left, right, or center swap).
- **Proportional Resizing:** Interactive splitters with persisted column and row weight ratios saved per note across Obsidian restarts.
- **Dual Mode (Preview & CM6 Editor):** Seamlessly toggle individual panels between native Obsidian markdown preview (with full callouts, math, internal links, and images) and CodeMirror 6 edit mode via toolbar button or double-click.
- **Live Bidirectional Synchronization:** Debounced auto-save engine writes tile modifications directly back to the active Markdown file without data loss.
- **One-Click Ribbon Launch:** Dedicated ribbon action (`columns-3` icon) to open the active markdown note in tiling view.
- **Hyprland-Style Keyboard Controls:** Comprehensive suite of hotkey commands for focus navigation, panel relocation, proportional resizing, and splitting.

---

## 🚀 Usage

### 1. Partition Note Content with `***`

Divide your note into multiple sections using standard Markdown horizontal rules (`***`):

```markdown
# Section A: Project Brief
Core goals, scope, and target milestones.
- Objective 1
- Objective 2

***

# Section B: Technical Architecture
Hexagonal ports and adapters layout.
```ts
interface IVaultPort {
  read(path: string): Promise<string>
}
```

***

# Section C: Scratchpad & Tasks
- [ ] Implement command palette handlers
- [x] Configure Biome formatting
- [ ] Run pure Vitest tests
```

### 2. Open in Tiling View

- Click the **Open note in Tiling view** ribbon icon (`columns-3` in the left sidebar).
- Or run `Tiling renderer: Open current note in tiling view` from the command palette (`Ctrl/Cmd + P`).

---

## ⌨️ Command Palette Reference

All actions can be bound to custom hotkeys in **Settings → Hotkeys**:

### General Actions
| Command | Description |
|---|---|
| `Tiling renderer: Open current note in tiling view` | Opens the active Markdown file in the dynamic tiling layout. |
| `Tiling renderer: Toggle preview and edit mode for all panels` | Bulk-toggles all panels between Markdown preview and CodeMirror 6 editor. |

### Hyprland Directional Focus
| Command | Description |
|---|---|
| `Tiling renderer: Focus left panel` | Moves active panel focus to the left neighbor. |
| `Tiling renderer: Focus right panel` | Moves active panel focus to the right neighbor. |
| `Tiling renderer: Focus panel above` | Moves active panel focus to the panel above. |
| `Tiling renderer: Focus panel below` | Moves active panel focus to the panel below. |

### Hyprland Directional Movement
| Command | Description |
|---|---|
| `Tiling renderer: Move panel left` | Shifts active panel position to the left. |
| `Tiling renderer: Move panel right` | Shifts active panel position to the right. |
| `Tiling renderer: Move panel up` | Shifts active panel position upwards. |
| `Tiling renderer: Move panel down` | Shifts active panel position downwards. |

### Hyprland Proportional Resizing
| Command | Description |
|---|---|
| `Tiling renderer: Shrink panel width` | Decreases active panel width ratio by 10%. |
| `Tiling renderer: Expand panel width` | Increases active panel width ratio by 10%. |
| `Tiling renderer: Shrink panel height` | Decreases active panel height ratio by 10%. |
| `Tiling renderer: Expand panel height` | Increases active panel height ratio by 10%. |

### Window Splitting & Modes
| Command | Description |
|---|---|
| `Tiling renderer: Split active panel horizontally (down)` | Splits the focused panel into a new row below. |
| `Tiling renderer: Split active panel vertically (right)` | Splits the focused panel into a new column to the right. |
| `Tiling renderer: Close active panel` | Closes the focused panel and merges its content. |
| `Tiling renderer: Toggle edit and preview mode for active panel` | Toggles the active panel between CodeMirror 6 and Markdown preview. |

---

## ⚙️ Settings

Customize layout behavior in **Settings → Tiling Renderer**:

| Setting | Default | Description |
|---|---|---|
| **Panel Gap** | `8` | Gap in pixels between tiled window panels. |
| **Debounce Delay** | `300` | Delay in milliseconds before sync writes back to the note file. |
| **Sync Text Order** | `true` | Automatically synchronizes text order in the Markdown document when panels are reordered. |

---

## 📥 Installation

### Via BRAT (Recommended for Beta Builds)
1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) in Obsidian (**Community plugins → Browse → BRAT**).
2. Open **Settings → BRAT** and click **Add Beta plugin**.
3. Enter repository path: `gidragir/obsidian-tiling-renderer`.
4. Enable **Tiling Renderer** in **Settings → Community Plugins**.

### Manual Installation
1. Download `main.js`, `manifest.json`, and `styles.css` from the [Latest Release](https://github.com/gidragir/obsidian-tiling-renderer/releases/latest).
2. Create a folder named `tiling-renderer` inside `<vault>/.obsidian/plugins/`.
3. Copy the downloaded files into `<vault>/.obsidian/plugins/tiling-renderer/`.
4. Reload Obsidian and enable **Tiling Renderer**.

---

## 🪐 Monorepo & Development

This plugin is developed within the [Obsidian Orbit](https://github.com/gidragir/obsidian-orbit) monorepo.

To build from source:
```bash
git clone https://github.com/gidragir/obsidian-orbit.git
cd obsidian-orbit
pnpm install
pnpm build
```

---

## 📄 License

MIT © [Obsidian Orbit](https://github.com/gidragir/obsidian-orbit) / [gidragir](https://github.com/gidragir)
