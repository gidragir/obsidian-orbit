---
description: "Autonomous self-healing verification cycle. Runs Biome, TypeScript typecheck, Vitest unit tests, and Turbo build with automatic fixes."
---

# Workflow: /verify

1. Run `pnpm biome check .` (on errors, run `pnpm lint && pnpm format`).
2. Run the type check: `pnpm turbo run typecheck`.
3. Run the Vitest unit tests: `pnpm turbo run test`.
4. Run a test build: `pnpm turbo run build`.
5. Produce a short status report on the success of the checks.

## ⚠️ Guard Clause (Loop Breaker)
- Maximum number of self-fix attempts (Max Retries) = 3.
- If `pnpm check` still returns an error after the 3rd attempt, the agent **must** break the loop and return control to the Orchestrator with a description of the unresolved problem.
