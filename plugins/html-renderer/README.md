# HTML Renderer for Obsidian

[![Part of Obsidian Orbit](https://img.shields.io/badge/Monorepo-Obsidian%20Orbit-7C3AED?logo=orbit)](https://github.com/gidragir/obsidian-orbit)
[![Obsidian Plugin](https://img.shields.io/badge/Obsidian-Community%20Plugin-7C3AED?logo=obsidian&logoColor=white)](https://obsidian.md)
[![GitHub Repository](https://img.shields.io/badge/GitHub-obsidian--html--renderer-blue?logo=github)](https://github.com/gidragir/obsidian-html-renderer)
[![Latest Release](https://img.shields.io/github/v/release/gidragir/obsidian-html-renderer?label=Release)](https://github.com/gidragir/obsidian-html-renderer/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> 🪐 **Monorepo:** Developed and maintained as part of [Obsidian Orbit](https://github.com/gidragir/obsidian-orbit).  
> 📦 **Standalone Satellite Repository:** [gidragir/obsidian-html-renderer](https://github.com/gidragir/obsidian-html-renderer)

Render self-contained HTML, CSS, and JavaScript widgets inside secure, isolated iframes within Obsidian notes.

---

## ✨ Features

- **Sandboxed Execution:** Executes embedded scripts within a sandboxed `<iframe>`, preventing stylesheet leaks, global namespace clashes, and Obsidian scope pollution.
- **Full Web Stack:** Supports embedded `<style>`, `<script>`, SVG graphics, Canvas animations, and web components.
- **Embedded Split Editor:** In-place code editing with a live reactive preview pane right inside your note.
- **Obsidian Theme Synchronization:** Inherits Obsidian's active theme palette and CSS variables (`--text-normal`, `--background-primary`, `--background-secondary`, `--interactive-accent`, etc.).
- **Configurable Security Policies:** Granular controls to toggle scripts, forms, popups, and modal dialogs.
- **Automatic & Custom Sizing:** Dynamic auto-height calculation to fit content without scrollbars, with fallback default dimensions.

---

## 🚀 Usage

Create an ````html-renderer```` code block anywhere in your Markdown notes:

````markdown
```html-renderer
<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    border-radius: 8px;
    background: var(--background-secondary, #202020);
    color: var(--text-normal, #e0e0e0);
    border: 1px solid var(--background-modifier-border, #333);
    font-family: var(--font-interface, sans-serif);
    max-width: 320px;
  }
  button {
    background: var(--interactive-accent, #7c3aed);
    color: var(--text-on-accent, #fff);
    border: none;
    border-radius: 4px;
    padding: 8px 14px;
    cursor: pointer;
    font-weight: 500;
  }
  button:hover {
    opacity: 0.9;
  }
</style>

<div class="card">
  <h3>Interactive HTML Widget</h3>
  <p>Count clicks in an isolated sandbox:</p>
  <button id="counter-btn">Clicks: 0</button>
</div>

<script>
  let count = 0;
  const btn = document.getElementById('counter-btn');
  btn.addEventListener('click', () => {
    count++;
    btn.textContent = `Clicks: ${count}`;
  });
</script>
```
````

---

## ⚙️ Settings

Customize behavior in **Settings → HTML Renderer**:

| Setting | Default | Description |
|---|---|---|
| **Auto Height** | `true` | Automatically adjusts iframe height based on content to eliminate unnecessary scrollbars. |
| **Default Height** | `300` | Fallback height in pixels when auto-height is disabled or during initial layout calculation. |
| **Allow Scripts** | `true` | Permits JavaScript execution inside the sandboxed iframe (`allow-scripts`). |
| **Allow Forms** | `true` | Permits HTML form submission inside the sandbox (`allow-forms`). |
| **Allow Popups** | `false` | Permits links and scripts to open new tabs or windows (`allow-popups`). |
| **Allow Modals** | `true` | Allows modal dialogs like `alert()`, `confirm()`, and `prompt()` (`allow-modals`). |
| **Inherit Obsidian Theme** | `true` | Automatically injects Obsidian theme colors, typography, and CSS variables into the iframe. |

---

## 📥 Installation

### Via BRAT (Recommended for Beta Builds)
1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) in Obsidian (**Community plugins → Browse → BRAT**).
2. Open **Settings → BRAT** and click **Add Beta plugin**.
3. Enter repository path: `gidragir/obsidian-html-renderer`.
4. Enable **HTML Renderer** in **Settings → Community Plugins**.

### Manual Installation
1. Download `main.js`, `manifest.json`, and `styles.css` from the [Latest Release](https://github.com/gidragir/obsidian-html-renderer/releases/latest).
2. Create a folder named `html-renderer` inside `<vault>/.obsidian/plugins/`.
3. Copy the downloaded files into `<vault>/.obsidian/plugins/html-renderer/`.
4. Reload Obsidian and enable **HTML Renderer** under Community Plugins.

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
