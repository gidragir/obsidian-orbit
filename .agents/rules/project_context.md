# 🧠 Project Context & OpenViking Knowledge Guide

> This project utilizes a 3-tier hierarchical knowledge base (OpenViking L0-L2) located in `.agents/knowledge/` to minimize context overhead and provide deterministic architectural guidance.

## 🧭 Multi-Tier Context Protocol

When working in this project, AI agents MUST follow this progressive disclosure procedure:

### 1. Level 0 (L0 Abstract) — Always First Step
- **File:** `.agents/knowledge/L0_index.json`
- **MCP Tool:** `project_knowledge(level="L0")` (if available)
- **Purpose:** Fast mental map of the system, list of all subsystems with IDs, and core architectural rules.
- **Action:** Check this file at the start of any new session or when unsure of the system boundaries before deep code exploration.

### 2. Level 1 (L1 Subsystems) — Module Boundaries
- **Files:** `.agents/knowledge/subsystems/<subsystem_id>.md`
- **MCP Tool:** `project_knowledge(level="L1", target="<subsystem_id>")` (if available)
- **Purpose:** Architectural contracts, entry points, dependencies, and validation commands for a specific module.
- **Action:** Before modifying or designing components within a subsystem, inspect its L1 contract.

### 3. Level 2 (L2 Deep Reference) — Commands & Decisions
- **CLI References:** `.agents/knowledge/cli/commands.md` (or `project_knowledge(level="L2", target="commands")`)
- **Architectural Decision Records:** `.agents/knowledge/adr/`
- **Action:** Record any non-trivial architectural decisions as new ADRs in `.agents/knowledge/adr/` (or via MCP `save_decision`). Keep documentation in sync by running `sync-knowledge`.

## ⚙️ Core Project Rules
- Строгая типизация (TypeScript strict mode) обязательна.
- Все зависимости управляются через package.json (pnpm / bun).
- Код должен форматироваться через biome / prettier.
