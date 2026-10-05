import { type App, ButtonComponent, MarkdownRenderer, Modal, type Plugin, Setting } from 'obsidian'
import { CodeEditor, type CodeEditorOptions } from './code-editor'

export type SplitViewMode = 'source' | 'preview' | 'split'

export interface SplitEditorModalOptions {
  readonly modalTitle?: string
  readonly titleFieldName?: string
  readonly titleFieldDesc?: string
  readonly initialTitle?: string
  readonly initialDoc: string
  readonly defaultMode?: SplitViewMode
  readonly editorOptions?: CodeEditorOptions
  readonly autoSaveIntervalMs?: number
  readonly renderPreview?: (doc: string, previewEl: HTMLElement) => void | Promise<void>
  readonly onSave: (doc: string, title?: string) => void
}

export class SplitEditorModal extends Modal {
  protected readonly plugin: Plugin
  protected readonly options: SplitEditorModalOptions

  private editor: CodeEditor | null = null
  private currentTitle: string | undefined
  private currentDoc = ''
  private currentMode: SplitViewMode = 'split'
  private autoSaveIntervalId: number | null = null
  private statusEl: HTMLElement | null = null

  private previewContainerEl: HTMLElement | null = null
  private splitBodyEl: HTMLElement | null = null
  private readonly modeButtons: Map<SplitViewMode, ButtonComponent> = new Map()

  constructor(app: App, plugin: Plugin, options: SplitEditorModalOptions) {
    super(app)
    this.plugin = plugin
    this.options = options
    this.currentTitle = options.initialTitle
    this.currentDoc = options.initialDoc
    this.currentMode = options.defaultMode ?? 'split'

    this.modalEl.addClass('orbit-split-editor-modal')
  }

  override onOpen(): void {
    const titleText =
      this.options.modalTitle ??
      (this.currentTitle ? `Edit: "${this.currentTitle}"` : 'Edit Content')
    this.titleEl.setText(titleText)
    this.contentEl.empty()

    this.renderTopBar()
    this.renderSplitBody()
    this.renderFooter()

    this.updateLayoutMode(this.currentMode)

    if (this.options.autoSaveIntervalMs && this.options.autoSaveIntervalMs > 0) {
      const intervalId = window.setInterval(() => {
        this.checkAutoSave()
      }, 1000)

      this.autoSaveIntervalId = intervalId
      this.plugin.registerInterval(intervalId)
    }
  }

  override onClose(): void {
    if (this.autoSaveIntervalId !== null) {
      window.clearInterval(this.autoSaveIntervalId)
      this.autoSaveIntervalId = null
    }
    this.editor?.destroy()
    this.editor = null
    this.statusEl = null
    this.previewContainerEl = null
    this.splitBodyEl = null
    this.modeButtons.clear()
    this.contentEl.empty()
  }

  private renderTopBar(): void {
    const topBar = this.contentEl.createDiv({ cls: 'orbit-editor-top-bar' })

    if (this.options.titleFieldName) {
      new Setting(topBar)
        .setName(this.options.titleFieldName)
        .setDesc(this.options.titleFieldDesc ?? '')
        .addText((text) => {
          text
            .setPlaceholder(this.options.titleFieldName ?? 'Title')
            .setValue(this.currentTitle ?? '')
            .onChange((value) => {
              this.currentTitle = value
              if (!this.options.modalTitle) {
                this.titleEl.setText(`Edit: "${value}"`)
              }
            })
        })
    }

    const modeControls = topBar.createDiv({ cls: 'orbit-editor-mode-switcher' })
    this.renderModeButton(modeControls, 'source', 'code', 'Source mode')
    this.renderModeButton(modeControls, 'split', 'columns', 'Split view')
    this.renderModeButton(modeControls, 'preview', 'eye', 'Preview mode')
  }

  private renderModeButton(
    container: HTMLElement,
    mode: SplitViewMode,
    icon: string,
    tooltip: string
  ): void {
    const btn = new ButtonComponent(container)
      .setIcon(icon)
      .setTooltip(tooltip)
      .setClass('clickable-icon')
      .onClick(() => this.updateLayoutMode(mode))

    this.modeButtons.set(mode, btn)
  }

  private renderSplitBody(): void {
    this.splitBodyEl = this.contentEl.createDiv({ cls: 'orbit-editor-split-body' })

    const editorPane = this.splitBodyEl.createDiv({
      cls: 'orbit-editor-pane orbit-editor-pane-source',
    })
    const editorLabel = editorPane.createDiv({ cls: 'orbit-pane-label text-muted' })
    editorLabel.setText('Source')

    this.editor = new CodeEditor(editorPane, this.currentDoc, {
      ...this.options.editorOptions,
      onSave: () => this.saveAndClose(),
      onDocChange: (doc) => {
        this.currentDoc = doc
        void this.renderPreview()
      },
    })

    const previewPane = this.splitBodyEl.createDiv({
      cls: 'orbit-editor-pane orbit-editor-pane-preview',
    })
    const previewLabel = previewPane.createDiv({ cls: 'orbit-pane-label text-muted' })
    previewLabel.setText('Live Preview')

    this.previewContainerEl = previewPane.createDiv({
      cls: 'orbit-live-preview-content markdown-rendered',
    })
    void this.renderPreview()
  }

  private async renderPreview(): Promise<void> {
    if (!this.previewContainerEl) return
    this.previewContainerEl.empty()

    if (this.options.renderPreview) {
      await this.options.renderPreview(this.currentDoc, this.previewContainerEl)
    } else {
      await MarkdownRenderer.render(
        this.app,
        this.currentDoc,
        this.previewContainerEl,
        '',
        this.plugin
      )
    }
  }

  private updateLayoutMode(mode: SplitViewMode): void {
    this.currentMode = mode

    for (const [m, btn] of this.modeButtons) {
      if (m === mode) {
        btn.buttonEl.addClass('is-active')
      } else {
        btn.buttonEl.removeClass('is-active')
      }
    }

    if (this.splitBodyEl) {
      this.splitBodyEl.removeClass('mode-source', 'mode-preview', 'mode-split')
      this.splitBodyEl.addClass(`mode-${mode}`)
    }
  }

  private renderFooter(): void {
    const footerEl = this.contentEl.createDiv({ cls: 'modal-button-container orbit-editor-footer' })

    this.statusEl = footerEl.createSpan({ cls: 'orbit-editor-status text-muted' })
    this.statusEl.setText('Ready')

    new ButtonComponent(footerEl).setButtonText('Cancel').onClick(() => this.close())

    new ButtonComponent(footerEl)
      .setButtonText('Save & Close')
      .setCta()
      .onClick(() => this.saveAndClose())
  }

  private checkAutoSave(): void {
    if (!this.editor?.hasChanges) {
      return
    }

    const elapsed = Date.now() - this.editor.lastEdited
    const interval = this.options.autoSaveIntervalMs ?? 5000
    if (elapsed > interval) {
      this.saveEditorData()
      if (this.statusEl) {
        this.statusEl.setText('Auto-saved')
      }
    }
  }

  private saveEditorData(): void {
    if (!this.editor) {
      return
    }

    const doc = this.editor.getDoc()
    this.editor.markSaved()
    this.options.onSave(doc, this.currentTitle)
  }

  private saveAndClose(): void {
    this.saveEditorData()
    this.close()
  }
}
