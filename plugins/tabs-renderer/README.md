# Tabs Renderer for Obsidian

[![Part of Obsidian Orbit](https://img.shields.io/badge/Monorepo-Obsidian%20Orbit-7C3AED?logo=orbit)](https://github.com/gidragir/obsidian-orbit)
[![Obsidian Plugin](https://img.shields.io/badge/Obsidian-Community%20Plugin-7C3AED?logo=obsidian&logoColor=white)](https://obsidian.md)
[![GitHub Repository](https://img.shields.io/badge/GitHub-obsidian--tabs--renderer-blue?logo=github)](https://github.com/gidragir/obsidian-tabs-renderer)
[![Latest Release](https://img.shields.io/github/v/release/gidragir/obsidian-tabs-renderer?label=Release)](https://github.com/gidragir/obsidian-tabs-renderer/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> 🪐 **Monorepo:** Developed and maintained as part of [Obsidian Orbit](https://github.com/gidragir/obsidian-orbit).  
> 📦 **Standalone Satellite Repository:** [gidragir/obsidian-tabs-renderer](https://github.com/gidragir/obsidian-tabs-renderer)

Organize your Obsidian notes into sleek, tabbed layouts using simple Markdown code blocks.

---

## ✨ Features

- **Markdown-First Tab Syntax:** Structure tabs directly in plain text using customizable delimiters (`tab: Title`) or standard Markdown headings (`# Tab Title`).
- **Rich Markdown Support:** Full support for internal links (`[[Note]]`), callouts, task lists, code blocks, math equations, and embedded media inside any tab.
- **Embedded Tab Editor Modal:** Edit tab titles and contents with an in-place CodeMirror 6 modal editor featuring live split preview.
- **Drag-and-Drop Reordering:** Intuitively reorder tabs via draggable handles.
- **Versatile Layout Orientations:** Position tab navigation on `top`, `bottom`, `left`, or `right` of the tab contents.
- **Granular Appearance Controls:** Configurable borders (`border-none`, `border-hover`, `border-always`), custom border colors, contents padding, line clamp, and maximum scrollable heights.
- **Native Obsidian Theme:** Inherits active theme colors, font styles, and responsive sizing across desktop and mobile.

---

## 🚀 Usage

Use the ````tabs-renderer```` code block in your notes:

### 1. Heading-Based Tabs

````markdown
```tabs-renderer
# Overview
Welcome to the project documentation!
- [[Architecture]]
- [[Roadmap]]

# Setup
Run the following commands to install dependencies:
```bash
pnpm install
pnpm dev
```

# FAQ
> [!TIP]
> Double click any tab area or click the edit icon to open the live editor modal.
```
````

---

### 2. Delimiter-Based Tabs (`tab: `)

````markdown
```tabs-renderer
tab: Notes
Daily notes, thoughts, and quick captures.

tab: Tasks
- [ ] Review PRs
- [x] Update documentation

tab: References
Useful links and bookmarks.
```
````

---

## ⚙️ Settings

Customize defaults in **Settings → Tabs Renderer**:

| Setting | Default | Description |
|---|---|---|
| **Split Delimiter** | `tab: ` | Prefix string used to separate tab items in delimiter mode. |
| **Default Title Position** | `top` | Position of the tab headers (`top`, `bottom`, `left`, `right`). |
| **Default Border Style** | `border-hover` | Tab container border mode (`border-none`, `border-hover`, `border-always`). |
| **Drag and Drop** | `false` | Enable or disable draggable tab reordering. |
| **Double Click to Edit** | `false` | Double-click on tab content to instantly open the editor modal. |
| **Show Toolbar** | `true` | Show the modal editor toolbar with action buttons. |
| **Tab Size** | `4` | Indentation spaces for the CodeMirror 6 modal editor. |
| **Auto-Save Interval** | `5000` | Auto-save interval in milliseconds for the tab editor. |
| **Contents Padding** | `1em 2em` | Custom CSS padding applied to the tab content area. |
| **Contents Max Height** | `none` | Maximum height constraint with scroll overflow (e.g., `400px` or `none`). |

---

## 📥 Installation

### Via BRAT (Recommended for Beta Builds)
1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) in Obsidian (**Community plugins → Browse → BRAT**).
2. Open **Settings → BRAT** and click **Add Beta plugin**.
3. Enter repository path: `gidragir/obsidian-tabs-renderer`.
4. Enable **Tabs Renderer** in **Settings → Community Plugins**.

### Manual Installation
1. Download `main.js`, `manifest.json`, and `styles.css` from the [Latest Release](https://github.com/gidragir/obsidian-tabs-renderer/releases/latest).
2. Create a folder named `tabs-renderer` inside `<vault>/.obsidian/plugins/`.
3. Copy the downloaded files into `<vault>/.obsidian/plugins/tabs-renderer/`.
4. Reload Obsidian and enable **Tabs Renderer**.

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
