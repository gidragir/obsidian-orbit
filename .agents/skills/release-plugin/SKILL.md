---
name: release-plugin
description: "Execute plugin release (major, minor, patch) via lightweight Flash subagent running pre-compiled CLI commands without codebase re-scanning."
---

# Release Plugin Skill (/release-plugin)

Dispatches a mechanical release pipeline to a fast, low-context subagent (`flash` tier). The Orchestrator compiles the exact CLI sequence and changelog during the implementation turn; the subagent executes commands sequentially without scanning files or diffs.

## 1. Input Contract

Extract or request three parameters:
- **`plugin`**: Target plugin name matching `plugins/<name>` (e.g. `vault-renderer`, `tabs-renderer`, `html-renderer`, `snippet-renderer`, `tiling-renderer`).
- **`bump`**: SemVer increment: `major`, `minor`, or `patch`.
- **`changelog`**: Functional changelog text. If omitted by the user, the Orchestrator synthesizes a concise 1–3 bullet summary from the current implementation session without re-scanning code files.

## 2. Orchestrator Pre-Compilation (Zero-Scan)

Do not re-read source files or parse git history. Assemble the release payload directly:

1. **Changeset Path**: `.changeset/<plugin>-<bump>.md`
2. **Changeset Content**:
   ```markdown
   ---
   "<plugin>": <bump>
   ---

   <changelog>
   ```
3. **Pre-Compiled CLI Chain**:
   - Write `.changeset/<plugin>-<bump>.md` with the changeset content above.
   - `pnpm check`
   - `git add .changeset/<plugin>-<bump>.md`
   - `git commit -m "chore(release): prepare <plugin> <bump> release"`
   - `git push origin main`
   - `gh run list --limit 3`

## 3. Subagent Dispatch Protocol

Invoke the fast subagent (`release-runner` or `executor`) using `invoke_subagent`:
- **`TypeName`**: `release-runner`
- **`Role`**: `Release Runner`
- **`Model`**: `flash` (fast model, minimal context window)
- **`Workspace`**: `inherit`

### Dispatch Prompt Template

```markdown
Execute this pre-compiled release pipeline sequentially.

CRITICAL INSTRUCTION:
Do NOT scan the codebase, inspect git diffs, or read source files.
Execute the shell commands and file writes directly.

1. Write file: `.changeset/<plugin>-<bump>.md`
Content:
---
"<plugin>": <bump>
---

<changelog>

2. Run CLI commands sequentially:
- pnpm check
- git add .changeset/<plugin>-<bump>.md
- git commit -m "chore(release): prepare <plugin> <bump> release"
- git push origin main
- gh run list --limit 3

If any command fails, halt immediately and report stderr.
On success, output commit SHA, push status, and active CI runs.
```

## 4. Completion Verification

Upon receiving the subagent response:
1. Verify status is `PASSED`.
2. Present a concise summary to the user:
   - Plugin & Bump: `<plugin>` (`<bump>`)
   - Commit SHA and link.
   - GitHub Actions workflow status.
   - Instruction to merge the release PR when ready: `pnpm release:merge`.
