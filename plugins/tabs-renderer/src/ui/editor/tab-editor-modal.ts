import { SplitEditorModal } from '@packages/ui'
import type { TabsSettings } from '@settings/settings'
import { type App, MarkdownRenderer, type Plugin } from 'obsidian'

export class TabsEditorModal {
  private readonly app: App
  private readonly plugin: Plugin
  private readonly settings: TabsSettings
  private modal: SplitEditorModal | null = null

  constructor(app: App, plugin: Plugin, settings: TabsSettings) {
    this.app = app
    this.plugin = plugin
    this.settings = settings
  }

  startEditing(
    initialTitle: string,
    initialDoc: string,
    sourcePath: string,
    onSave: (title: string, doc: string) => void
  ): void {
    this.modal = new SplitEditorModal(this.app, this.plugin, {
      titleFieldName: 'Tab title',
      titleFieldDesc: 'Display name shown in the navigation bar',
      initialTitle,
      initialDoc,
      defaultMode: 'split',
      autoSaveIntervalMs: this.settings.editorAutoSaveInterval,
      editorOptions: {
        language: 'markdown',
        tabSize: this.settings.tabSize,
        showToolbar: this.settings.showToolbar,
      },
      renderPreview: async (doc, previewEl) => {
        await MarkdownRenderer.render(this.app, doc, previewEl, sourcePath, this.plugin)
      },
      onSave: (doc, title) => {
        onSave(title ?? initialTitle, doc)
      },
    })

    this.modal.open()
  }
}
