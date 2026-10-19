# Subsystem: Types (L1)

> **Identifier:** `packages_types`
> **Tags:** packages_types, TypeScript / JavaScript (Node/Bun/Deno) | **Size:** ~449 BPE tokens

## 🎯 Purpose and role
Subsystem `packages/types` with key entry points: packages/types/src/index.ts, packages/types/package.json

## 📁 Entry points and file structure

| File | Lines | Status |
| :--- | :--- | :--- |
| `packages/types/src/index.ts` | 54 | ⭐ Entry point |
| `packages/types/package.json` | 17 | ⭐ Entry point |
| `packages/types/tsconfig.json` | 4 | Source code |

## 🔑 Key contract and exports
```text
export type Result<T, E = Error> = |
export function ok<T>(value: T): Result<T, never>
export function err<E = Error>(error: E): Result<never, E>
export function isOk<T, E>( result: Result<T, E> ): result is
export function isErr<T, E>( result: Result<T, E> ): result is
export interface IFileMeta
export interface HotkeyDefinition
export interface CommandDefinition
export interface NoticeOptions
```

## 🧪 Running and testing
```bash
rtk pnpm --filter types test
```
