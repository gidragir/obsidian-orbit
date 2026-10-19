# Subsystem: Vault Renderer (L1)

> **Identifier:** `plugins_vault-renderer`
> **Tags:** plugins_vault-renderer, TypeScript / JavaScript (Node/Bun/Deno) | **Size:** ~13535 BPE tokens

## 🎯 Purpose and role
Subsystem `plugins/vault-renderer` with key entry points: plugins/vault-renderer/src/main.ts, plugins/vault-renderer/package.json

## 📁 Entry points and file structure

| File | Lines | Status |
| :--- | :--- | :--- |
| `plugins/vault-renderer/src/main.ts` | 137 | ⭐ Entry point |
| `plugins/vault-renderer/package.json` | 25 | ⭐ Entry point |
| `plugins/vault-renderer/src/settings/settings-tab.ts` | 276 | Source code |
| `plugins/vault-renderer/src/core/dag-scheduler.ts` | 215 | Source code |
| `plugins/vault-renderer/src/services/scheduler-service.ts` | 205 | Source code |
| `plugins/vault-renderer/src/core/telemetry.ts` | 153 | Source code |
| `plugins/vault-renderer/src/core/telemetry.test.ts` | 107 | Source code |
| `plugins/vault-renderer/src/core/shadow-storage.ts` | 105 | Source code |
| `plugins/vault-renderer/src/adapters/obsidian-plugin-adapter.ts` | 105 | Source code |
| `plugins/vault-renderer/src/core/dag-scheduler.test.ts` | 104 | Source code |
| `plugins/vault-renderer/src/services/telemetry-service.ts` | 101 | Source code |
| `plugins/vault-renderer/src/core/platform-matrix.test.ts` | 96 | Source code |
| `plugins/vault-renderer/src/core/shadow-storage.test.ts` | 92 | Source code |
| `plugins/vault-renderer/src/settings/settings.ts` | 78 | Source code |
| `plugins/vault-renderer/src/core/interaction-guard.ts` | 75 | Source code |

## 🔑 Key contract and exports
```text
export interface VaultRendererHost
export class VaultRendererSettingTab extends PluginSettingTab
export const PHASE_ORDER: readonly StartupPhase[] = ['instant', 'interactive', 'deferred', 'idle'] export const PHASE_RANK: Readonly<Record<StartupPhase, number>> =
export interface PhaseQueueItem
export interface StartupPlan
export function topologicalSort( targetIds: readonly string[], adj: Map<string, string[]> ):
export function hoistPhases( targetIds: readonly string[], configs: Record<string, PluginProfileConfig> ):
export function planStartupQueue( configs: Record<string, PluginProfileConfig>, targetIds: readonly string[] ): StartupPlan
export class SchedulerService
```

## 🧪 Running and testing
```bash
rtk pnpm --filter vault-renderer test
```
