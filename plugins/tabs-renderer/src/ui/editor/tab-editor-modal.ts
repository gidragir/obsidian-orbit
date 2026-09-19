import type { TabsSettings } from '@settings/settings'
import { type App, ButtonComponent, Modal, type Plugin, Setting } from 'obsidian'
import { TabEditor } from './tab-editor'

export class TabsEditorModal extends Modal {
  private readonly plugin: Plugin
  private readonly settings: TabsSettings
  private editor: TabEditor | null = null
  private currentTitle = ''
  private onSaveCallback: ((title: string, doc: string) => void) | null = null
  private autoSaveIntervalId: number | null = null
  private statusEl: HTMLElement | null = null

  constructor(app: App, plugin: Plugin, settings: TabsSettings) {
    super(app)
    this.plugin = plugin
    this.settings = settings
    this.modalEl.addClass('tabs-editor-modal')
  }

  startEditing(
    initialTitle: string,
    initialDoc: string,
    onSave: (title: string, doc: string) => void
  ): void {
    this.currentTitle = initialTitle
    this.onSaveCallback = onSave
    this.titleEl.setText(`Edit Tab: "${initialTitle}"`)
    this.contentEl.empty()

    new Setting(this.contentEl)
      .setName('Tab title')
      .setDesc('Display name shown in the navigation bar')
      .addText((text) => {
        text
          .setPlaceholder('Tab title')
          .setValue(this.currentTitle)
          .onChange((value) => {
            this.currentTitle = value
            this.titleEl.setText(`Edit Tab: "${value}"`)
          })
      })

    const editorSection = this.contentEl.createDiv({ cls: 'tabs-editor-section' })
    const editorLabel = editorSection.createDiv({ cls: 'tabs-editor-label setting-item-name' })
    editorLabel.setText('Tab content (Markdown)')

    this.editor = new TabEditor(
      editorSection,
      initialDoc,
      this.settings.tabSize,
      this.settings.showToolbar,
      () => this.saveAndClose()
    )

    this.renderFooter()
    this.open()
  }

  private renderFooter(): void {
    const footerEl = this.contentEl.createDiv({ cls: 'modal-button-container tabs-editor-footer' })

    this.statusEl = footerEl.createSpan({ cls: 'tabs-editor-status text-muted' })
    this.statusEl.setText('Ready')

    new ButtonComponent(footerEl).setButtonText('Cancel').onClick(() => this.close())

    new ButtonComponent(footerEl)
      .setButtonText('Save & Close')
      .setCta()
      .onClick(() => this.saveAndClose())
  }

  onOpen(): void {
    if (this.settings.editorAutoSaveInterval > 0) {
      const intervalId = window.setInterval(() => {
        this.checkAutoSave()
      }, 1000)

      this.autoSaveIntervalId = intervalId
      this.plugin.registerInterval(intervalId)
    }
  }

  onClose(): void {
    if (this.autoSaveIntervalId !== null) {
      window.clearInterval(this.autoSaveIntervalId)
      this.autoSaveIntervalId = null
    }
    this.editor?.destroy()
    this.editor = null
    this.onSaveCallback = null
    this.statusEl = null
  }

  private checkAutoSave(): void {
    if (!this.editor?.hasChanges) {
      return
    }

    const elapsed = Date.now() - this.editor.lastEdited
    if (elapsed > this.settings.editorAutoSaveInterval) {
      this.saveEditorData()
      if (this.statusEl) {
        this.statusEl.setText('Auto-saved')
      }
    }
  }

  private saveEditorData(): void {
    if (!this.editor || !this.onSaveCallback) {
      return
    }

    const doc = this.editor.getDoc()
    this.editor.markSaved()
    this.onSaveCallback(this.currentTitle, doc)
  }

  private saveAndClose(): void {
    this.saveEditorData()
    this.close()
  }
}
