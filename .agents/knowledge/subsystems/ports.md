# Subsystem: ports (L1)

> **Identifier:** `ports`
> **Tags:** interfaces, ports | **Size:** ~388 BPE tokens

## 🎯 Purpose and role
Interfaces for interacting with external systems.

## 📁 Entry points and file structure

| File | Lines | Status |
| :--- | :--- | :--- |
| `packages/ports/src/index.ts` | 36 | ⭐ Entry point |
| `packages/ports/package.json` | 20 | ⭐ Entry point |
| `packages/ports/tsconfig.json` | 4 | Source code |

## 🔑 Key contract and exports
```text
export interface IVaultPort
export interface ICommandPort
export interface ISettingsPort<T = unknown>
export interface INoticePort
export interface IClipboardPort
```

## 🧪 Running and testing
```bash
rtk pnpm --filter ports test
```
