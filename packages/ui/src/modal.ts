import { type App, Modal } from 'obsidian'

/**
 * Base modal wrapper providing clean lifecycle hooks.
 */
export abstract class BaseModal extends Modal {
  constructor(app: App) {
    super(app)
  }

  override onOpen(): void {
    const { contentEl } = this
    contentEl.empty()
    this.onOpenContent(contentEl)
  }

  override onClose(): void {
    const { contentEl } = this
    this.onCloseContent()
    contentEl.empty()
  }

  protected abstract onOpenContent(contentEl: HTMLElement): void

  protected onCloseContent(): void {
    // Optional hook for subclasses to clean up listeners or state
  }
}
