import type { IClipboardPort } from '@packages/ports'

export class ClipboardService {
  private readonly clipboard: IClipboardPort

  constructor(clipboard: IClipboardPort) {
    this.clipboard = clipboard
  }

  async read(): Promise<string> {
    return await this.clipboard.readText()
  }

  async write(text: string): Promise<void> {
    await this.clipboard.writeText(text)
  }
}
