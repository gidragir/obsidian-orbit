---
trigger: glob
globs: ["plugins/**"]
description: "Standards for Obsidian plugins lifecycle, DOM event registration, manifest compliance, DND data isolation, and theme-safe CSS variable styling."
---

# 20: Obsidian Plugins Standards & Lifecycle

1. **Entry point:** Default export `export default class MyPlugin extends Plugin`.
2. **Memory safety:** Event listeners only via `this.registerDomEvent`, `this.registerEvent`; timers via `this.registerInterval`.
3. **Styling:** No hardcoded colors in `src/styles.css`. Only native theme variables (`var(--text-normal)`, `var(--background-primary)`).
4. **Manifest:** `id` strictly matches the folder name, `minAppVersion >= 1.7.0`, `isDesktopOnly: false`.
5. **Drag-and-Drop isolation:** In HTML5 DND, do not pass service tokens/IDs as `'text/plain'`, to avoid the browser and CodeMirror auto-inserting them into the text buffer under the cursor. Use only custom MIME types (`application/x-<plugin>-<entity>`) with a call to `e.stopPropagation()`.
6. **Note rendering:** Custom UI views of note sections must use the native `MarkdownRenderer.render` (class `.markdown-rendered.markdown-preview-view`), supporting separate preview and edit modes.
7. **Isolation of display geometry and note AST (Dual State Isolation):**
   * The visual layout of panes/tabs (`FileLayoutState`, `TileNode`, geometry) and the physical Markdown content of the note on disk (`vault.modify`) are independent state layers.
   * Changing the pane layout (Drag & Drop, splits, resize) must NOT mutate the order of text/sections in the note file by default, without an explicit user setting (`syncTextOrder` with a default of `true` or `false`).
   * When synchronizing text order, the service must atomically synchronize both representations: the in-memory document sections (`document.sections`) and the indices in the node tree (`reindexTreeLeaves`), preventing a reverse swap on file reload.
8. **Dynamic reconciliation of persistent geometry (Dynamic Section Reconciliation):**
   * Plugins that split notes into sections (tiles, tabs, splitters) must implement a pure reconciliation function (`reconcileTreeWithSections` / `reconcileLayoutWithItems`).
   * When a view is opened (`setFile`), the file changes, or an external change occurs (`vault.on('modify')`), the stored geometry must be reconciled with the actual number of sections:
     - When separators/sections are added, new containers must be created automatically next to the previous ones, preserving existing proportions and weights.
     - When separators/sections are removed, redundant containers must be removed, collapsing empty branches.
   * During inline section editing, entering separators must trigger a document recalculation and the creation of new panes when editing finishes.
   * The `vault.on('modify')` listener in a view must deduplicate its own autosaves (`diskContent === inMemorySerialized`) to prevent the active editor from losing focus.
9. **Spatial navigation in tiling interfaces (Two-Tier Directional Navigation):**
   * When implementing focus switching or pane movement in 4 directions (`up`, `down`, `left`, `right`), pure Euclidean distance between pane centers must not be used.
   * The neighbor search algorithm must implement a two-tier heuristic (Two-Tier Overlap):
     - **Tier 1 (Direct split/column):** When there is physical overlap on the cross axis (`crossOverlap > 0`), distance is measured strictly between adjacent edges (edge-to-edge gap). Such candidates have absolute priority over panes in neighboring branches.
     - **Tier 2 (Diagonal/neighboring splits):** Candidates without physical projection overlap receive a blocking penalty that prevents diagonal focus jumps when column widths or heights are unequal.
10. **No committing runtime data (`data.json`):** Default settings are defined in `DEFAULT_SETTINGS` in `src/settings/types.ts`. `data.json` files are created by Obsidian solely at runtime on the user's machine and are excluded from version control via `.gitignore`.
11. **Mandatory import of shared monorepo styles & UI reuse:**
    * Every standalone plugin must declare `"@packages/ui": "workspace:*"` in `dependencies` of `package.json`.
    * Every plugin must declare `@import '../../../packages/ui/src/styles.css';` strictly on line 1 of its `src/styles.css`.
    * Reusing shared CSS tokens and components from `@packages/ui` (`.orbit-badge`, `.orbit-badge--pill`, `.orbit-card`, `.orbit-stats-grid`, `.orbit-stat-card`, `.orbit-filter-tabs`, `.orbit-filter-tab`, `.orbit-empty-state`, `.orbit-control-label`, split editor layouts, buttons) and native Obsidian CSS variables is strictly mandatory.
    * Duplicating base card borders, stat card grids, pill badges, segmented tab buttons, or default font colors (`--text-normal`) in plugin-specific stylesheets is prohibited. Plugin `src/styles.css` files must only contain domain-specific layout, grid dimensions, and unique component styling.
12. **"Shared Packages First" principle:** Do not create local inline CodeMirror editors, splitter drag handlers, or hand-written frontmatter parsers if they already exist in `@packages/*`.
13. **Autosave and I/O isolation (Debounced File Sync):** Domain document services must not work with `Vault` and `setTimeout` directly. Saving is delegated to the `@packages/adapters` adapter (`DebouncedWorkspaceFileAdapter`).
14. **Hygiene of settings panels and plugin orchestrators (Settings Hygiene & Sync Preservation):**
    * **Filtering disabled plugins by default:** Lists of managed plugins/modules in settings panels must hide inactive and disabled entities by default ("Active only" mode by default) with category counters (`Active` / `All` / `Disabled`).
    * **Respecting the Obsidian system status:** On first initialization, orchestrators must reconcile state with `app.plugins.enabledPlugins`. Forcing `enabled: true` on plugins that the user disabled in the main Obsidian interface is strictly prohibited.
    * **Protecting cross-platform configurations:** Settings normalization on one host (e.g. Desktop) must take the current platform into account and preserve the `enabled: true` state for mobile plugins (`mobile-only`) and remote modules absent on the current device.
    * **Blocking incompatible runtime launch:** Before calling `enablePlugin`, the adapter must strictly validate platform compatibility (`isPluginAllowedOnPlatform`), preventing mobile plugins from launching on desktop when settings are toggled.
15. **Cold Start & Plugin Orchestration (Native Bootstrap Separation):**
    * **Obsidian Synchronous Loading Trap:** The `<configDir>/community-plugins.json` file is read and evaluated synchronously by the Obsidian engine upon startup. All plugins listed in it are parsed and executed on the main UI thread before `app.workspace.onLayoutReady`.
    * **Isolation of Deferred Plugins:** To prevent main thread freezing and optimize Time-to-Interactive (TTI), heavy plugins (databases, canvases, search indexers, Markdown block renderers) must be omitted from native `community-plugins.json`.
    * **Dynamic Execution & In-Memory Registry Synchronization:**
      - Plugin orchestrators must keep only `instant` (themes, UI frame) and `interactive` plugins in `community-plugins.json`, while launching `deferred` and `idle` plugins dynamically via runtime API (`app.plugins.enablePlugin(id)`).
      - **Mandatory In-Memory Parity:** Obsidian's `enablePlugin(id)` does NOT add the plugin to `app.plugins.enabledPlugins`. The orchestrator adapter MUST explicitly execute `manager.enabledPlugins.add(id)` so native settings UI and third-party integrations detect the plugin as active.
    * **`saveConfig` Interception Architecture:**
      - The plugin list in Obsidian is persisted strictly via `app.plugins.saveConfig()` (invoked through debounced `requestSaveConfig = debounce(this.saveConfig, 1000)`).
      - Monkey-patching `enablePluginAndSave`/`disablePluginAndSave` or `savePluginData` is strictly prohibited. Intercept `saveConfig()` exclusively.
      - When intercepted: if `!manager.enabledPlugins.has(selfPluginId)`, the user is disabling the orchestrator. The interceptor MUST immediately call `uninstall()` and restore the full active plugins list without `selfPluginId`.
    * **Lifecycle Separation (Quitting vs Disabling):**
      - Detect application shutdown (`isAppQuitting = true`) via `window.addEventListener('beforeunload')` and `app.workspace.on('quit')`.
      - On application shutdown, preserve the lightweight bootstrap stub on disk for the next cold boot.
      - On manual plugin disablement (`isAppQuitting === false`), `onunload()` MUST immediately restore the complete native plugin list from the mirror backup (`.obsidian/community-plugins.<plugin>.bak`).
    * **Reactive Settings Sync:** Any modification to plugin phases or active filters in the orchestrator GUI must reactively synchronize the bootstrap stub on disk without requiring manual button presses.

