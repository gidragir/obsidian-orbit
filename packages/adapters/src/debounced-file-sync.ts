import { type App, MarkdownView, type TFile } from 'obsidian'

export interface DebouncedWorkspaceFileAdapterOptions {
  readonly debounceMs?: number
}

/**
 * Adapter that encapsulates debounced disk writes via Vault
 * and synchronizes open MarkdownView instances.
 */
export class DebouncedWorkspaceFileAdapter {
  private readonly app: App
  private readonly debounceMs: number
  private saveTimeout: ReturnType<typeof setTimeout> | null = null
  private pendingTarget: { file: TFile; getContent: () => string } | null = null

  constructor(app: App, options: DebouncedWorkspaceFileAdapterOptions = {}) {
    this.app = app
    this.debounceMs = options.debounceMs ?? 500
  }

  scheduleSave(file: TFile, getContent: () => string): void {
    // If a different file has a pending write, flush it immediately before scheduling
    if (this.pendingTarget && this.pendingTarget.file.path !== file.path) {
      const prev = this.pendingTarget
      this.cancelPendingTimeout()
      void this.safeSave(prev.file, prev.getContent())
    }

    this.cancelPendingTimeout()
    this.pendingTarget = { file, getContent }

    this.saveTimeout = setTimeout(async () => {
      this.saveTimeout = null
      const current = this.pendingTarget
      this.pendingTarget = null
      if (current) {
        await this.safeSave(current.file, current.getContent())
      }
    }, this.debounceMs)
  }

  async flushSave(file: TFile, getContent: () => string): Promise<void> {
    this.cancelPendingTimeout()
    this.pendingTarget = null
    await this.safeSave(file, getContent())
  }

  syncOpenMarkdownViews(file: TFile, content: string): void {
    const leaves = this.app.workspace.getLeavesOfType('markdown')
    for (const leaf of leaves) {
      const view = leaf.view
      if (view instanceof MarkdownView && view.file?.path === file.path) {
        view.setViewData(content, false)
      }
    }
  }

  private async safeSave(file: TFile, content: string): Promise<void> {
    try {
      await this.app.vault.modify(file, content)
      this.syncOpenMarkdownViews(file, content)
    } catch (error) {
      console.error(`[DebouncedWorkspaceFileAdapter] Failed to modify file ${file.path}:`, error)
    }
  }

  private cancelPendingTimeout(): void {
    if (this.saveTimeout !== null) {
      clearTimeout(this.saveTimeout)
      this.saveTimeout = null
    }
  }

  dispose(): void {
    this.cancelPendingTimeout()
    this.pendingTarget = null
  }
}
