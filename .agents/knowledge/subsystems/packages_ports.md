# Subsystem: Ports (L1)

> **Identifier:** `packages_ports`
> **Tags:** packages_ports, TypeScript / JavaScript (Node/Bun/Deno) | **Size:** ~388 BPE tokens

## 🎯 Purpose and role
Subsystem `packages/ports` with key entry points: packages/ports/src/index.ts, packages/ports/package.json

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
