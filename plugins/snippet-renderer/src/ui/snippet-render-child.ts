import { extractVariables, parseLanguageAndSource, substituteVariables } from '@utils/parser'
import { type App, MarkdownRenderChild, MarkdownRenderer } from 'obsidian'

export class SnippetRenderChild extends MarkdownRenderChild {
  private readonly app: App
  private readonly source: string
  private readonly sourcePath: string
  private readonly fenceHeader: string | undefined

  private language = 'bash'
  private cleanSource = ''
  private variables: readonly string[] = []
  private readonly values: Record<string, string> = {}
  private resultPreContainer: HTMLElement | null = null

  constructor(
    containerEl: HTMLElement,
    app: App,
    source: string,
    sourcePath: string,
    fenceHeader?: string | undefined
  ) {
    super(containerEl)
    this.app = app
    this.source = source
    this.sourcePath = sourcePath
    this.fenceHeader = fenceHeader
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
    sourceSection.createDiv({
      text: 'Source template',
      cls: 'script-template-section-title',
    })

    const sourcePreContainer = sourceSection.createDiv({
      cls: 'script-template-code-pre',
    })

    void MarkdownRenderer.render(
      this.app,
      `\`\`\`${this.language}\n${this.cleanSource}\n\`\`\``,
      sourcePreContainer,
      this.sourcePath,
      this
    )
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
