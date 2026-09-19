/**
 * Ports defining core interfaces for external system interactions.
 * 0% dependencies on Obsidian runtime or DOM APIs.
 */

import type { CommandDefinition, IFileMeta } from '@packages/types'

export interface IVaultPort {
  read(path: string): Promise<string>
  readBinary(path: string): Promise<ArrayBuffer>
  write(path: string, content: string): Promise<void>
  writeBinary(path: string, data: ArrayBuffer): Promise<void>
  append(path: string, content: string): Promise<void>
  delete(path: string): Promise<void>
  exists(path: string): Promise<boolean>
  list(folderPath?: string): Promise<ReadonlyArray<IFileMeta>>
  getMeta(path: string): Promise<IFileMeta | null>
}

export interface ICommandPort {
  registerCommand(command: CommandDefinition): void
}

export interface ISettingsPort<T = unknown> {
  loadSettings(): Promise<T>
  saveSettings(settings: T): Promise<void>
}

export interface INoticePort {
  show(message: string, timeoutMs?: number): void
}

export interface IClipboardPort {
  readText(): Promise<string>
  writeText(text: string): Promise<void>
}
