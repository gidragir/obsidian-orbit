import { replaceCodeBlock } from '@packages/adapters'
import { formatCodeBlock } from '@packages/obsidian-utils'
import { SplitEditorModal } from '@packages/ui'
import { extractVariables, parseLanguageAndSource, substituteVariables } from '@utils/parser'
import {
  type App,
  ButtonComponent,
  MarkdownRenderChild,
  MarkdownRenderer,
  type MarkdownSectionInformation,
  MarkdownView,
  type Plugin,
} from 'obsidian'

export class SnippetRenderChild extends MarkdownRenderChild {
  private readonly app: App
  private readonly plugin: Plugin
  private readonly source: string
  private readonly sourcePath: string
  private readonly fenceHeader: string | undefined
  private readonly sectionInfo: MarkdownSectionInformation | null

  private language = 'bash'
  private cleanSource = ''
  private variables: readonly string[] = []
  private readonly values: Record<string, string> = {}
  private resultPreContainer: HTMLElement | null = null

  constructor(
    containerEl: HTMLElement,
    app: App,
    plugin: Plugin,
    source: string,
    sourcePath: string,
    fenceHeader?: string | undefined,
    sectionInfo?: MarkdownSectionInformation | null
  ) {
    super(containerEl)
    this.app = app
    this.plugin = plugin
    this.source = source
    this.sourcePath = sourcePath
    this.fenceHeader = fenceHeader
    this.sectionInfo = sectionInfo ?? null
  }

  onload(): void {
    const parsed = parseLanguageAndSource(this.source, this.fenceHeader)
    this.language = parsed.language
    this.cleanSource = parsed.cleanSource
    this.variables = extractVariables(this.cleanSource)

    this.containerEl.empty()
    this.renderStructure()
  }

  private renderStructure(): void {
    const container = this.containerEl.createDiv({
      cls: 'script-template-container',
    })

    const leftCol = container.createDiv({
      cls: 'script-template-col script-template-left',
    })
    this.renderInputsSection(leftCol)
    this.renderSourceSection(leftCol)

    const rightCol = container.createDiv({
      cls: 'script-template-col script-template-right',
    })
    this.renderPreviewSection(rightCol)
  }

  private renderInputsSection(parentEl: HTMLElement): void {
    const inputsSection = parentEl.createDiv({
      cls: 'script-template-section script-template-inputs-section',
    })
    inputsSection.createDiv({
      text: 'Variables',
      cls: 'script-template-section-title',
    })

    const inputsContainer = inputsSection.createDiv({
      cls: 'script-template-inputs',
    })

    if (this.variables.length === 0) {
      inputsContainer.createDiv({
        text: 'No variables found',
        cls: 'script-template-empty',
      })
      return
    }

    for (const varName of this.variables) {
      this.renderVariableInput(inputsContainer, varName)
    }
  }

  private renderVariableInput(parentEl: HTMLElement, varName: string): void {
    const groupEl = parentEl.createDiv({
      cls: 'script-template-input-group',
    })

    groupEl.createEl('label', {
      text: `$${varName}`,
      cls: 'script-template-label',
    })

    const inputEl = groupEl.createEl('input', {
      type: 'text',
      placeholder: `Value for $${varName}...`,
      cls: 'script-template-input',
    })

    this.registerDomEvent(inputEl, 'input', () => {
      this.values[varName] = inputEl.value
      this.updatePreview()
    })
  }

  private renderSourceSection(parentEl: HTMLElement): void {
    const sourceSection = parentEl.createDiv({
      cls: 'script-template-section script-template-source-section',
    })
    const headerRow = sourceSection.createDiv({
      cls: 'script-template-section-header',
    })
    headerRow.createDiv({
      text: 'Source template',
      cls: 'script-template-section-title',
    })

    if (this.sectionInfo) {
      new ButtonComponent(headerRow)
        .setIcon('lucide-pencil')
        .setTooltip('Edit snippet template')
        .setClass('clickable-icon')
        .onClick(() => this.openEditModal())
    }

    const sourcePreContainer = sourceSection.createDiv({
      cls: 'script-template-code-pre',
    })

    if (this.sectionInfo) {
      this.registerDomEvent(sourcePreContainer, 'dblclick', (e) => {
        e.preventDefault()
        this.openEditModal()
      })
    }

    void MarkdownRenderer.render(
      this.app,
      `\`\`\`${this.language}\n${this.cleanSource}\n\`\`\``,
      sourcePreContainer,
      this.sourcePath,
      this
    )
  }

  private openEditModal(): void {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
    const editor = activeView?.editor
    if (!editor || !this.sectionInfo) return

    const modal = new SplitEditorModal(this.app, this.plugin, {
      modalTitle: 'Edit Snippet Template',
      initialDoc: this.cleanSource,
      defaultMode: 'split',
      editorOptions: {
        language: 'markdown',
        showToolbar: true,
      },
      renderPreview: async (doc, previewEl) => {
        const parsed = substituteVariables(doc, this.values)
        await MarkdownRenderer.render(
          this.app,
          `\`\`\`${this.language}\n${parsed}\n\`\`\``,
          previewEl,
          this.sourcePath,
          this.plugin
        )
      },
      onSave: (newTemplate) => {
        const section = this.sectionInfo
        if (!section) return
        const trimmedTemplate = newTemplate.replace(/\r\n/g, '\n').trimEnd()
        const content = this.language
          ? `lang: ${this.language}\n${trimmedTemplate}`
          : trimmedTemplate
        const fullBlock = formatCodeBlock('snippet-renderer', content)
        replaceCodeBlock(editor, section, fullBlock, '```snippet-renderer')
      },
    })

    modal.open()
  }

  private renderPreviewSection(parentEl: HTMLElement): void {
    const previewSection = parentEl.createDiv({
      cls: 'script-template-section script-template-preview-section',
    })
    previewSection.createDiv({
      text: 'Final result',
      cls: 'script-template-section-title',
    })

    this.resultPreContainer = previewSection.createDiv({
      cls: 'script-template-code-pre',
    })

    this.updatePreview()
  }

  private updatePreview(): void {
    if (!this.resultPreContainer) {
      return
    }

    this.resultPreContainer.empty()
    const currentText = substituteVariables(this.cleanSource, this.values)
    void MarkdownRenderer.render(
      this.app,
      `\`\`\`${this.language}\n${currentText}\n\`\`\``,
      this.resultPreContainer,
      this.sourcePath,
      this
    )
  }
}
