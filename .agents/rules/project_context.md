# 🧠 Project Context & OpenViking Knowledge Guide (context-init MCP-First)

> This project utilizes a 3-tier hierarchical knowledge base (OpenViking L0-L2) managed by the `context-init` native MCP server.
> Direct reading of `.agents/knowledge/**` files via `view_file` or bash commands is strictly prohibited.

## 🧭 Multi-Tier Context Protocol (MCP-First)

When working in this project, AI agents MUST follow this progressive disclosure procedure using `call_mcp_tool` with ServerName `"context-init"`:

### 1. Level 0 (L0 Abstract) — Always First Step
- **Tool:** `context_get_subsystems`
- **Arguments:** `{}`
- **Purpose:** Fast mental map of the system, list of all subsystems with IDs, entrypoints, and token metrics.
- **Action:** Call this tool at the start of a session or when unsure of system boundaries before deep code exploration.

### 2. Level 1 (L1 Subsystems) — Module Boundaries
- **Tool:** `context_get_subsystem`
- **Arguments:** `{"subsystem_id": "<subsystem_id>"}`
- **Purpose:** Architectural contracts, entry points, key files, and test commands for a specific subsystem.
- **Action:** Before modifying or designing components within a subsystem, fetch its L1 card.

### 3. Level 2 (L2 Deep Reference) — AST-Packed Context
- **Tool:** `context_pack`
- **Arguments:** `{"subsystem_id": "<subsystem_id>", "compress": true}`
- **Purpose:** AST-compressed interface snapshot (function bodies replaced by `⋮----`), providing code context without window bloat.
- **Action:** Use when researching signatures or preparing implementation across module boundaries.

### 4. Drift Verification & Sync — Before Task Completion
- **Tool:** `context_check`
- **Arguments:** `{}`
- **Purpose:** Architectural drift detector. Validates knowledge base sync against files on disk.
- **Action:** Run before finalizing any task. If `has_drift: true`, call `context_update`.

## ⚙️ Core Project Rules
- Строгая типизация (TypeScript strict mode) обязательна.
- Все зависимости управляются через `pnpm-workspace.yaml` / `package.json` (pnpm).
- Код должен форматироваться через Biome (`pnpm lint && pnpm format`).
