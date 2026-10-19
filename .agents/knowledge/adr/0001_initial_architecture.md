# ADR 0001: Initial architecture and topology of obsidian-orbit

- **Status:** Accepted
- **Date:** 2026-10-10
- **Stack:** TypeScript / JavaScript (Node/Bun/Deno)

## Context
Initialization of the `obsidian-orbit` codebase. To enable reliable autonomous navigation for AI assistants, a three-tier context model (OpenViking L0-L2) was adopted.

## Architectural subsystem boundaries
- **.changeset** (`changeset`): Configuration for managing changes in the project.
- **.vault** (`vault`): Contains plugin source files and their configurations.
- **dev-vault** (`dev-vault`): Plugin development and testing.
- **adapters** (`adapters`): Adapters for interacting with the Obsidian API.
- **core** (`core`): The system core, including tile structure and geometry.
- **obsidian-utils** (`obsidian-utils`): Utilities for working with Obsidian, such as link parsing and formatting.
- **ports** (`ports`): Interfaces for interacting with external systems.
- **tsconfig** (`tsconfig`): TypeScript configurations for the project.
- **types** (`types`): Types for handling results and errors.
- **ui** (`ui`): User interface for editing and interaction.
- **reference** (`reference`): Reference information and plugin usage examples.
- **scripts** (`scripts`): Scripts for automating build and deployment processes.


## Decision
1. `L0_index.json` and `L0_index.md` serve as the single entry point (Mental Map) with minimal token consumption.
2. Each subsystem is isolated in an L1 card (`subsystems/*.md`) listing entry points and signatures.
3. The L2 command reference (`cli/commands.md`) records the actual build and verification commands.

## Consequences
- Eliminates the need to recursively scan the entire repository on every prompt.
- Agents consult individual L1 cards as needed.
