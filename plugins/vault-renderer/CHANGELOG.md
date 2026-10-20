# vault-renderer

## 1.0.0

### Major Changes

- Initial release of Vault Renderer plugin (v1.0.0):
  - Platform-Aware Plugin Matrix: Conditionally enable or disable plugins specifically for desktop or mobile platforms
  - Multi-Phase Startup Scheduler: Stagger plugin loading across `instant`, `interactive`, `deferred`, and `idle` phases to maximize cold startup responsiveness
  - DAG Topological Sorting: Topological scheduler ensuring plugin dependencies are loaded in correct hierarchical order with cycle detection
  - Interaction Guard: Automatically pauses deferred/idle plugin activations while the user is actively typing or interacting with notes
  - Shadow Storage Engine: Directional settings sync (`bidirectional`, `to-cloud`, `from-cloud`, `isolated`) for granular cross-vault configuration control
  - Cold-Start Telemetry: High-precision startup phase profiling measuring $T_{interactive}$ from `performance.timeOrigin`
  - Native Bootstrap Synchronization: Keeps on-disk `community-plugins.json` minimal (instant/interactive phases only) to prevent Obsidian synchronous evaluation trap, with full mirror backup in `.vault-renderer.bak`
  - Failsafe Lifecycle Automation: Differentiates app quit (preserving the bootstrap stub) from manual plugin disablement (restoring full plugin list), with Crash Canary recovery and emergency command palette restore actions
  - Declarative Settings Tab: Built with `@packages/ui` design system and Obsidian 1.13+ deep search indexing
