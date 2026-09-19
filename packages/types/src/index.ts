/**
 * Pure domain types and utilities with 0% runtime or third-party dependencies.
 */

export type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E }

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

export function err<E = Error>(error: E): Result<never, E> {
  return { ok: false, error }
}

export function isOk<T, E>(
  result: Result<T, E>
): result is { readonly ok: true; readonly value: T } {
  return result.ok
}

export function isErr<T, E>(
  result: Result<T, E>
): result is { readonly ok: false; readonly error: E } {
  return !result.ok
}

export interface IFileMeta {
  readonly path: string
  readonly name: string
  readonly basename: string
  readonly extension: string
  readonly size: number
  readonly mtime: number
  readonly ctime: number
}

export interface HotkeyDefinition {
  readonly modifiers: ReadonlyArray<string>
  readonly key: string
}

export interface CommandDefinition {
  readonly id: string
  readonly name: string
  readonly callback?: () => void | Promise<void>
  readonly checkCallback?: (checking: boolean) => boolean | undefined
  readonly hotkeys?: ReadonlyArray<HotkeyDefinition>
}

export interface NoticeOptions {
  readonly timeout?: number
}
