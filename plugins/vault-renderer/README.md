# Vault Renderer for Obsidian

[![Part of Obsidian Orbit](https://img.shields.io/badge/Monorepo-Obsidian%20Orbit-7C3AED?logo=orbit)](https://github.com/gidragir/obsidian-orbit)
[![Obsidian Plugin](https://img.shields.io/badge/Obsidian-Community%20Plugin-7C3AED?logo=obsidian&logoColor=white)](https://obsidian.md)
[![GitHub Repository](https://img.shields.io/badge/GitHub-obsidian--vault--renderer-blue?logo=github)](https://github.com/gidragir/obsidian-vault-renderer)
[![Latest Release](https://img.shields.io/github/v/release/gidragir/obsidian-vault-renderer?label=Release)](https://github.com/gidragir/obsidian-vault-renderer/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> 🪐 **Monorepo:** Developed and maintained as part of [Obsidian Orbit](https://github.com/gidragir/obsidian-orbit).  
> 📦 **Standalone Satellite Repository:** [gidragir/obsidian-vault-renderer](https://github.com/gidragir/obsidian-vault-renderer)

**Vault Renderer** is an intelligent lifecycle orchestrator, delayed startup scheduler, and platform-aware sync manager for Obsidian. It eliminates startup freezes and slashes cold-boot times by staging plugin initialization across prioritized phases.

---

## The Problem

As Obsidian vaults grow, power users routinely install 30–50+ community plugins. This leads to:

- **Painful Cold Starts:** Startup times balloon to 8–15+ seconds while heavy plugin bundles (Dataview, Excalidraw, Omnisearch) parse and execute synchronously.
- **Input Lag & UI Freezes:** Launching Obsidian to quickly capture a thought results in skipped keystrokes, stuttering, and unresponsiveness.
- **Mobile Overhead:** Heavy desktop-oriented plugins run on mobile devices, consuming scarce RAM and battery.
- **Settings Collisions:** Desktop configurations (hotkeys, window positions, local paths) overwrite mobile preferences during sync.

---

## How It Works

Vault Renderer transforms Obsidian's monolithic, blocking boot process into a prioritized, non-blocking pipeline:

1. **4-Phase Startup Queue:**
   - ⚡ **Instant (0 ms):** Themes, frame adjusters, and essential styling (e.g., *Style Settings*, *Minimal Theme*, *Hider*).
   - ✍️ **Interactive (0 ms):** Core writing tools, typing helpers, and quick switchers. Vault reaches **Time-to-Interactive (TTI)** at this point—ready for immediate note-taking.
   - ⏳ **Deferred (staggered 50–200 ms):** Heavy productivity engines (e.g., *Dataview*, *Excalidraw*, *Tasks*, *Kanban*, *Charts View*), initialized smoothly in the background.
   - 💤 **Idle (deferred 500–2500 ms):** Background indexing and utilities (e.g., *Omnisearch*, *Linter*, *BRAT*).
2. **DAG Topological Dependency Resolution:** Automatically resolves inter-plugin dependencies to ensure prerequisites load before dependents, with cycle detection.
3. **Interaction Guard:** Listens to user keystrokes, clicks, and scroll events. If you begin typing or navigating, background plugin initialization **instantly pauses** until the event loop is idle, guaranteeing zero typing latency.
4. **Platform-Aware Plugin Matrix:** Effortlessly toggle plugins to load on `all`, `desktop-only`, `mobile-only`, or `disabled`.
5. **Shadow Storage Engine:** Protects `data.json` with granular sync modes (`bidirectional`, `to-cloud`, `from-cloud`, `isolated`) using `data.local.json` or `data.<platform>.json` to prevent multi-device setting overwrites.
6. **Built-in Telemetry:** Millisecond-accurate cold-boot tracking and slowest-plugin profiling directly in your settings tab.
7. **Native Bootstrap Synchronization & Disaster Recovery:**
   - Obsidian synchronously blocks cold starts evaluating all plugins in `community-plugins.json`. Vault Renderer maintains a minimal bootstrap stub on disk (`vault-renderer` + `instant` + `interactive`) while heavy `deferred` and `idle` plugins are dynamically activated at runtime.
   - **Disaster Recovery & Anti-Brick Failsafe:** Automatic mirror backup `.obsidian/community-plugins.vault-renderer.bak` preserves all active plugins. Clean separation ensures app shutdown keeps the fast stub, while manual disablement or emergency restore command instantly repopulates the full list. Built-in Crash Canary detects startup loops and restores from backup automatically.

---

## Real-World Performance Report

Benchmark measured in a production vault with **38 community plugins**:

| Metric | Before Vault Renderer | With Vault Renderer | Improvement |
| :--- | :---: | :---: | :---: |
| **Time-to-Interactive (TTI)** | **~8.0s – 14.9s** | **~1.6s – 2.0s** | **4x – 8x faster** 🚀 |
| **Keystroke Latency on Boot** | 100–500 ms (dropped keys) | **0 ms (silky smooth)** | **Zero UI freeze** 🛡️ |
| **Background Load Stagger** | All at once (spike) | Smooth phased queue | Constant 60 FPS |

### Managed Plugin Distribution (38 Plugins):
- **Instant (4 plugins, 0 ms delay):** Minimal Theme, Style Settings, Hider, Notebook Navigator.
- **Interactive (13 plugins, 0 ms delay):** Typing assistants, Advanced Tables, Quick Switcher++, Outline, Markdown enhancements.
- **Deferred (16 plugins, 50–200 ms staggered delays):** Dataview, Excalidraw (~5 MB), Charts View (~3.3 MB), Tasks, Kanban, Meta-Bind, Hover Editor.
- **Idle (5 plugins, 50–250 ms delays):** Omnisearch, Linter, Paste Image Rename, BRAT.

---

## Example Configuration

A practical preset (`data.json`) illustrating staged loading and platform isolation:

```json
{
  "enableScheduler": true,
  "enablePlatformFilter": true,
  "enableShadowStorage": true,
  "enableTelemetry": true,
  "interactionGuardTimeoutMs": 1500,
  "deferredPhaseDelayMs": 800,
  "idlePhaseDelayMs": 2500,
  "plugins": {
    "obsidian-style-settings": { "id": "obsidian-style-settings", "enabled": true, "filter": "all", "phase": "instant", "delayMs": 0, "dependencies": [], "syncMode": "bidirectional" },
    "switcher-plus": { "id": "switcher-plus", "enabled": true, "filter": "all", "phase": "interactive", "delayMs": 0, "dependencies": [], "syncMode": "bidirectional" },
    "dataview": { "id": "dataview", "enabled": true, "filter": "all", "phase": "deferred", "delayMs": 100, "dependencies": [], "syncMode": "bidirectional" },
    "obsidian-excalidraw-plugin": { "id": "obsidian-excalidraw-plugin", "enabled": true, "filter": "desktop-only", "phase": "deferred", "delayMs": 200, "dependencies": [], "syncMode": "isolated" },
    "omnisearch": { "id": "omnisearch", "enabled": true, "filter": "all", "phase": "idle", "delayMs": 150, "dependencies": [], "syncMode": "bidirectional" }
  }
}
```

---

## Quick Start & Tuning Strategy

1. **Install & Enable** Vault Renderer.
2. **Open Settings → Vault Renderer** to inspect installed plugins and live telemetry.
3. **Assign Phases** using rules of thumb:
   - **Instant:** UI, themes, and CSS adjusters required to prevent visual flickering.
   - **Interactive:** Tools needed within the first 3 seconds (capturing notes, hotkey switchers).
   - **Deferred:** Heavy feature plugins (Dataview, Excalidraw, Kanban). Set a 50–150 ms stagger between them.
   - **Idle:** Background indexing, linting, and sync tools that can safely wait 2–5 seconds.
4. **Test & Verify:** Run `Vault Renderer: Run startup orchestration sequence` from the command palette (`Ctrl/Cmd + P`) or reload Obsidian (`Ctrl/Cmd + R`) to review boot timings in Telemetry.

---

## Configuration Reference

### Global Settings
| Option | Default | Description |
| :--- | :---: | :--- |
| `enableScheduler` | `true` | Enables 4-phase staged startup queue. |
| `enablePlatformFilter` | `true` | Enforces desktop/mobile platform rules. |
| `enableShadowStorage` | `true` | Intercepts settings reads/writes for device-isolated configs. |
| `enableTelemetry` | `true` | Measures cold start and per-plugin loading times. |
| `enableBootstrapSync` | `true` | Maintains minimal early-phase stub in community-plugins.json on disk. |
| `interactionGuardTimeoutMs` | `1500` | Idle debounce before resuming deferred loading after user activity. |
| `deferredPhaseDelayMs` | `800` | Delay after interactive phase before starting deferred queue. |
| `idlePhaseDelayMs` | `2500` | Delay after deferred phase before starting idle queue. |

### Per-Plugin Attributes
- **Phase:** `instant` | `interactive` | `deferred` | `idle`
- **Filter:** `all` | `desktop-only` | `mobile-only` | `disabled`
- **Sync Mode:** `bidirectional` (default `data.json`) | `to-cloud` | `from-cloud` (uses `data.local.json`) | `isolated` (uses `data.<platform>.json`)
- **Delay:** Stagger interval in ms for deferred/idle phases.

---

## Installation

### Via BRAT
1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) in Obsidian.
2. In BRAT settings, click **Add Beta plugin** and enter `gidragir/obsidian-vault-renderer`.
3. Enable **Vault Renderer** under **Settings → Community Plugins**.

### Manual Installation
1. Download `main.js`, `manifest.json`, and `styles.css` from [Releases](https://github.com/gidragir/obsidian-vault-renderer/releases/latest).
2. Create `<vault>/.obsidian/plugins/vault-renderer/` and copy the downloaded files into it.
3. Reload Obsidian and enable the plugin.

---

## Frequently Asked Questions

<details>
<summary><b>Will deferred plugins cause missing UI elements initially?</b></summary>
Commands and ribbon icons of deferred plugins appear once their phase executes (typically within 1–2 seconds). For essential note-taking commands, place that plugin in <code>interactive</code>.
</details>

<details>
<summary><b>How are plugin dependencies handled?</b></summary>
Vault Renderer builds a Directed Acyclic Graph (DAG) before execution. If Plugin B depends on Plugin A, Plugin A is automatically scheduled first, even if both share the same phase.
</details>

<details>
<summary><b>How does Shadow Storage prevent sync conflicts?</b></summary>
With <code>isolated</code> or <code>from-cloud</code> mode, Vault Renderer routes local writes to <code>data.local.json</code> or <code>data.&lt;platform&gt;.json</code> without polluting the synced <code>data.json</code> file.
</details>

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

## License

MIT © [Obsidian Orbit](https://github.com/gidragir/obsidian-orbit) / [gidragir](https://github.com/gidragir)
