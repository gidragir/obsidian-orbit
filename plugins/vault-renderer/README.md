# Vault Renderer

Vault Renderer is a performance and sync orchestration plugin for Obsidian.

## Features

- **Platform-Aware Plugin Matrix:** Conditionally enable or disable plugins specifically for desktop or mobile platforms.
- **Multi-Phase Startup Scheduler:** Stagger plugin loading across `instant`, `interactive`, `deferred`, and `idle` phases to maximize cold startup responsiveness.
- **DAG Topological Sorting:** Ensures plugin dependencies are loaded in correct hierarchical order with cycle detection.
- **Interaction Guard:** Automatically pauses deferred/idle plugin activations while the user is actively typing or interacting with notes.
- **Shadow Storage Engine:** Granular control over plugin settings (`data.json`) synchronization:
  - `bidirectional`: Standard full synchronization.
  - `to-cloud`: Master mode (local pushes to cloud).
  - `from-cloud`: Replica mode (cloud settings as base with local overlay).
  - `isolated`: Platform-specific isolated configuration files.
- **Cold-Start Telemetry:** Precise performance tracking measuring $T_{interactive}$ from `performance.timeOrigin`.
