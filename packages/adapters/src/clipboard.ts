import type { IClipboardPort } from '@packages/ports'

export class ClipboardAdapter implements IClipboardPort {
  async readText(): Promise<string> {
    try {
      return await navigator.clipboard.readText()
    } catch (error) {
      console.error('[ClipboardAdapter] Failed to read from clipboard:', error)
      return ''
    }
  }

  async writeText(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('[ClipboardAdapter] Failed to write to clipboard:', error)
    }
  }
}
