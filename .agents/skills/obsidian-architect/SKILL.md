---
name: obsidian-architect
description: "Provides architectural patterns, lifecycle safety contracts, event management, and Ports & Adapters isolation for Obsidian.md plugins and packages. Use when designing new plugins, restructuring plugin internals, or interacting with Obsidian Vault and MetadataCache APIs."
---

# Obsidian Architect Skill

1. **Ports and Adapters:** Domain interfaces live in `src/utils/`, `app.vault` adapters in `src/services/`.
2. **Lifecycle:** Register all subscriptions strictly via `this.registerEvent`, `this.registerDomEvent`, `this.registerInterval`.
3. **Thin `main.ts`:** The `onload()` method is offloaded into private methods `registerCommands()`, `registerViews()`.
4. **Safe styles & UI reuse:** Declare `"@packages/ui": "workspace:*"` in `dependencies`, import `@import '../../../packages/ui/src/styles.css';` on line 1 of `src/styles.css`, and reuse shared classes (`.orbit-badge`, `.orbit-card`, `.orbit-stats-grid`, `.orbit-stat-card`, `.orbit-filter-tabs`, `.orbit-empty-state`, `.orbit-control-label`) and native Obsidian theme CSS variables to eliminate duplicate boilerplate.
5. **Safe DND:** UI drag controllers use isolated MIME types (`application/x-*`) and stop event propagation into text editors.
6. **Preview / Edit pattern:** When building tile/block views of notes, design the interface as a two-mode model: reading via `MarkdownRenderer.render` and on-demand editing via CM6 with `syntaxHighlighting`.
7. **Spatial tile navigation:** Focus navigation (`focusInDirection`) and pane movement (`moveInDirection`) must be isolated in pure math functions of the domain core (`@packages/core`) with two-tier overlap scoring (edge projections instead of centers), guaranteeing deterministic behavior for any split proportions.
8. **I/O isolation and Debounced File Sync:** The note domain model (sections, AST, geometry) is isolated from Obsidian objects (`TFile`, `Vault`). All autosave-to-disk operations and synchronization of open `MarkdownView`s are delegated to the `DebouncedWorkspaceFileAdapter` adapter from `@packages/adapters`.
9. **Unified interactive controllers:** Interactive UI components (pane resizing via splitters, internal wiki-link interception, 2D DND drop zones) are implemented via the ready-made `@packages/ui` controllers: `attachSplitterDrag`, `attachInternalLinkHandler`, `computeDropZone2D`, which must return a `cleanup()` unsubscribe function.
10. **Startup Phase Orchestration & TTI Budgeting:**
    * Plugins and architectural solutions must partition startup lifecycle into 4 deterministic phases:
      - `instant` (0 ms): themes, foundational CSS, UI hiders, file navigators.
      - `interactive` (0 ms): hotkeys, layout switchers, direct text editing.
      - `deferred` (default >1000 ms + Interaction Guard): code block parsers, databases (Dataview), kanbans, SVG/Excalidraw canvases.
      - `idle` (>2500 ms): global search indexers (Omnisearch), linters, auto-syncers.
    * Input State Monitoring (`Interaction Guard`): background loading of deferred services must be suspended/paused during active user typing or mouse events to prevent input micro-stutters.
11. **Native Bootstrap Optimization & `saveConfig` Interception Pattern:**
    * When designing startup orchestrators or plugin schedulers, avoid intercepting `disablePluginAndSave` or `enablePluginAndSave` directly (breaks self-unloading and creates deadlocks).
    * Target the internal `manager.saveConfig()` method in `app.plugins` as the single synchronization bottleneck.
    * Ensure in-memory registry parity: when dynamically enabling deferred plugins via `enablePlugin(id)`, always invoke `manager.enabledPlugins.add(id)`.
    * Guard against self-disabling loops: if `!manager.enabledPlugins.has(selfPluginId)` during `saveConfig()`, unbind the interceptor immediately and flush the restored native plugin list.
    * Maintain an emergency mirror `.obsidian/community-plugins.<orchestrator>.bak` and differentiate application shutdown (preserve minimal stub on disk) from manual plugin disablement (restore full list).
12. **Runtime Memory Optimization Invariant (The Electron Memory Ceiling Taboo):**
    * **Prohibition of Runtime Plugin & Tab Hibernation:** Never attempt to dynamically disable/suspend community plugins or swap `WorkspaceLeaf` instances with placeholder views during runtime to reduce RAM usage.
    * **Root Cause & Architectural Ceiling:**
      - In Chromium/Electron, `PartitionAlloc` does not eagerly return freed virtual pages to the OS Working Set. The hardware floor for 2 Electron windows with GPU acceleration is ~400–450 MB; attempting to drop below this is physically impossible without terminating processes.
      - Disabling plugins at runtime (`disablePlugin`) unregisters their command palette entries and breaks user hotkeys (e.g. Omnisearch, QuickAdd), introducing unacceptable user friction and state desync.
    * **Valid Optimization Vector:**
      - Focus optimization exclusively on **Startup Phase Orchestration** (TTI, DAG scheduler, deferring initialization), not runtime memory swapping.
      - Low-overhead non-invasive techniques (e.g. Low Power Mode via CSS animation disabling on window blur) are acceptable, but must never manipulate plugin lifecycle or workspace leaf DOM at runtime.


