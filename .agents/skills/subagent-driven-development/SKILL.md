---
name: subagent-driven-development
description: "Executes implementation plans using isolated subagents for each step with two-stage review. Activate for multi-step tasks, refactorings, or complex features requiring context isolation."
---

# Subagent-Driven Development (Superpowers Workflow)

This workflow executes multi-step plans by delegating each task to isolated subagents, protecting the coordinator's context window and ensuring high-rigor quality control.

## Process Flow

```
[Approved Plan] 
       │
       ▼
  For each task step:
       ├── 1. Gather Context / Repomix   ──► researcher (Flash)
       ├── 2. Discrete Implementation    ──► executor (Flash)
       ├── 3. Architecture & Spec Review ──► reviewer (Pro)
       │         └── If changes requested: loop back to executor (max 3 cycles)
       ├── 4. Automated Verification     ──► verifier (Flash)
       └── 5. Mark Complete in Plan
```

## Step-by-Step Instructions

### Step 1: Initialize Task Step
- Extract the single current step from the active plan (`implementation_plan.md`).
- Ensure prerequisites and dependencies from previous steps are met.

### Step 2: Context Gathering & Reference Audit (researcher - Flash)
- If the step involves migrating reference code, locating symbols, or analyzing Repomix snapshots (`reference/*-context.md`), invoke `researcher`.
- **Input**: Target plugin/feature, relevant files in `reference/` or `plugins/`, and required symbols.
- **Output**: Compact summary of legacy patterns to replace, public contracts, and suggested domain isolation.

### Step 3: Discrete Implementation (executor - Flash)
- Invoke `executor` with the specific task scope and gathered context.
- **Input**: Exact file paths, target behavior, and strict monorepo rules (no `any`, no `enum`, no `!`, no relative `../../` imports).
- **Output**: Confirmation of changes, newly created files, and Vitest test coverage for domain utils.

### Step 4: Spec & Architecture Review (reviewer - Pro)
1. **Invariants & Complexity Review**:
   - Invoke `reviewer` on the newly introduced or modified files.
   - Verify:
     - Cognitive complexity $\le 15$, cyclomatic $\le 10$, function length $\le 40$ lines.
     - Pure domain logic in `src/utils/` (zero Obsidian/DOM imports).
     - Thin `main.ts` facade (`onload()` $\le 20-30$ lines).
     - Memory leak safety (`registerEvent`, `registerDomEvent`, `registerInterval`).
   - If findings are marked `CHANGES_REQUESTED`, re-dispatch `executor` to address fixes (max 3 cycles).

### Step 5: Automated Verification (verifier - Flash)
- Invoke `verifier` to run the autonomous verification cycle:
  `pnpm biome check .` -> `pnpm turbo run typecheck` -> `pnpm turbo run test` -> `pnpm turbo run build`.
- In case of formatting/lint issues, run `pnpm lint && pnpm format`.
- Adhere to the 3-retry guard clause to prevent infinite loops.

### Step 6: Step Completion & Progress Update
- Update `implementation_plan.md` checking off the completed task.
- Proceed to the next step.
