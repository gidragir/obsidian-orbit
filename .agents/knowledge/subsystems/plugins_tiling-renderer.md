# Subsystem: Tiling Renderer (L1)

> **Identifier:** `plugins_tiling-renderer`
> **Tags:** plugins_tiling-renderer, TypeScript / JavaScript (Node/Bun/Deno) | **Size:** ~128073 BPE tokens

## 🎯 Purpose and role
Subsystem `plugins/tiling-renderer` with key entry points: plugins/tiling-renderer/src/main.ts, plugins/tiling-renderer/package.json

## 📁 Entry points and file structure

| File | Lines | Status |
| :--- | :--- | :--- |
| `plugins/tiling-renderer/src/main.ts` | 312 | ⭐ Entry point |
| `plugins/tiling-renderer/package.json` | 30 | ⭐ Entry point |
| `plugins/tiling-renderer/src/ui/tiling-panel-renderer.ts` | 372 | Source code |
| `plugins/tiling-renderer/src/ui/tiling-view.ts` | 347 | Source code |
| `plugins/tiling-renderer/src/services/tiling-sync-service.test.ts` | 138 | Source code |
| `plugins/tiling-renderer/src/services/tiling-sync-service.ts` | 132 | Source code |
| `plugins/tiling-renderer/src/settings/settings-tab.ts` | 106 | Source code |
| `plugins/tiling-renderer/src/ui/panel-dnd-controller.ts` | 101 | Source code |
| `plugins/tiling-renderer/data.json` | 31 | Source code |
| `plugins/tiling-renderer/README.md` | 29 | Source code |
| `plugins/tiling-renderer/main.js` | 29 | Source code |
| `plugins/tiling-renderer/src/settings/settings.ts` | 25 | Source code |
| `plugins/tiling-renderer/CHANGELOG.md` | 13 | Source code |
| `plugins/tiling-renderer/tsconfig.json` | 12 | Source code |
| `plugins/tiling-renderer/manifest.json` | 9 | Source code |

## 🔑 Key contract and exports
```text
export interface TilingPanelHost
export class TilingPanelRenderer
export const TILING_VIEW_TYPE = 'orbit-tiling-view' export interface TilingLayoutHost
export class TilingView extends ItemView implements TilingPanelHost
```

## 🧪 Running and testing
```bash
rtk pnpm --filter tiling-renderer test
```
