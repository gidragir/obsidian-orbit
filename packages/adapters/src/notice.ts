import type { INoticePort } from '@packages/ports'
import { Notice } from 'obsidian'

export class ObsidianNoticeAdapter implements INoticePort {
  show(message: string, timeoutMs?: number): void {
    new Notice(message, timeoutMs)
  }
}
