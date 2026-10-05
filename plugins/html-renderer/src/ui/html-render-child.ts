import { replaceCodeBlock } from '@packages/adapters'
import { formatCodeBlock } from '@packages/obsidian-utils'
import { SplitEditorModal } from '@packages/ui'
import type { ContentLoader } from '@services/content-loader'
import type { ThemeService } from '@services/theme-service'
import type { HTMLRendererSettings } from '@settings/settings'
import { HTMLDocumentBuilder } from '@utils/document-builder'
import { buildSandboxFlags } from '@utils/sandbox'
import { resolveSourceType } from '@utils/source-parser'
import {
  type App,
  ButtonComponent,
  MarkdownRenderChild,
  type MarkdownSectionInformation,
  MarkdownView,
  Notice,
  type Plugin,
} from 'obsidian'

interface ResizeMessage {
  readonly type: 'html-renderer-resize'
  readonly height: number
}

function isResizeMessage(data: unknown): data is ResizeMessage {
  if (typeof data !== 'object' || data === null) {
    return false
  }
  const record = data as Record<string, unknown>
  return (
    record.type === 'html-renderer-resize' &&
    typeof record.height === 'number' &&
    !Number.isNaN(record.height)
  )
}

export class HTMLRenderChild extends MarkdownRenderChild {
  private readonly app: App
  private readonly plugin: Plugin
  private readonly source: string
  private readonly settings: HTMLRendererSettings
  private readonly contentLoader: ContentLoader
  private readonly themeService: ThemeService
  private readonly sectionInfo: MarkdownSectionInformation | null

  constructor(
    containerEl: HTMLElement,
    app: App,
    plugin: Plugin,
    source: string,
    settings: HTMLRendererSettings,
    contentLoader: ContentLoader,
    themeService: ThemeService,
    _sourcePath: string,
    sectionInfo?: MarkdownSectionInformation | null
  ) {
    super(containerEl)
    this.app = app
    this.plugin = plugin
    this.source = source
    this.settings = settings
    this.contentLoader = contentLoader
    this.themeService = themeService
    this.sectionInfo = sectionInfo ?? null
  }

  onload(): void {
    void this.renderWidget()
  }

  private async renderWidget(): Promise<void> {
    this.containerEl.empty()

    let htmlContent = ''
    try {
      const strategy = resolveSourceType(this.source)
      htmlContent = await this.contentLoader.load(strategy)
    } catch (error) {
      this.renderError(error)
      return
    }

    const container = this.containerEl.createDiv({
      cls: 'html-renderer-container',
    })
    const fullHtml = this.buildDocument(htmlContent)
    const iframe = this.renderIframe(container, fullHtml)
    this.renderHeader(container, iframe, fullHtml)

    if (this.settings.autoHeight) {
      this.setupAutoResize(iframe)
    }
  }

  private buildDocument(htmlContent: string): string {
    const tokens = this.settings.inheritObsidianTheme ? this.themeService.getThemeTokens() : null

    return new HTMLDocumentBuilder()
      .setHtmlContent(htmlContent)
      .withThemeStyles(this.settings.inheritObsidianTheme)
      .withThemeTokens(tokens)
      .withAutoResizeScript(this.settings.autoHeight)
      .build()
  }

  private renderHeader(parentEl: HTMLElement, iframe: HTMLIFrameElement, fullHtml: string): void {
    const header = parentEl.createDiv({ cls: 'html-renderer-header' })
    header.createSpan({ cls: 'html-renderer-title', text: 'HTML Render' })

    const actions = header.createDiv({ cls: 'html-renderer-actions' })

    if (this.sectionInfo) {
      new ButtonComponent(actions)
        .setIcon('lucide-pencil')
        .setTooltip('Edit HTML')
        .setClass('clickable-icon')
        .onClick(() => this.openEditModal())
    }

    const refreshBtn = actions.createEl('button', {
      cls: 'html-renderer-reload-btn',
      text: 'Reload',
    })

    this.registerDomEvent(refreshBtn, 'click', () => {
      iframe.srcdoc = fullHtml
      new Notice('HTML block reloaded')
    })
  }

  private openEditModal(): void {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
    const editor = activeView?.editor
    if (!editor || !this.sectionInfo) return

    const modal = new SplitEditorModal(this.app, this.plugin, {
      modalTitle: 'Edit HTML',
      initialDoc: this.source,
      defaultMode: 'split',
      editorOptions: {
        language: 'html',
        showToolbar: true,
      },
      renderPreview: (doc, previewEl) => {
        previewEl.empty()
        const fullDoc = this.buildDocument(doc)
        const previewIframe = previewEl.createEl('iframe', {
          cls: 'html-renderer-iframe',
        })
        previewIframe.style.setProperty('height', '100%')
        previewIframe.style.setProperty('width', '100%')
        previewIframe.setAttribute('sandbox', buildSandboxFlags(this.settings))
        previewIframe.srcdoc = fullDoc
      },
      onSave: (newContent) => {
        const section = this.sectionInfo
        if (!section) return
        const fullBlock = formatCodeBlock('html-renderer', newContent)
        replaceCodeBlock(editor, section, fullBlock, '```html-renderer')
      },
    })

    modal.open()
  }

  private renderIframe(parentEl: HTMLElement, fullHtml: string): HTMLIFrameElement {
    const iframe = parentEl.createEl('iframe', {
      cls: 'html-renderer-iframe',
    })
    iframe.style.setProperty('height', `${this.settings.defaultHeight}px`)
    iframe.setAttribute('sandbox', buildSandboxFlags(this.settings))
    iframe.srcdoc = fullHtml

    if (this.sectionInfo) {
      this.registerDomEvent(parentEl, 'dblclick', (e) => {
        // avoid triggering when clicking header
        if ((e.target as HTMLElement).closest('.html-renderer-header')) return
        e.preventDefault()
        this.openEditModal()
      })
    }

    return iframe
  }

  private setupAutoResize(iframe: HTMLIFrameElement): void {
    let currentHeight = this.settings.defaultHeight

    this.registerDomEvent(window, 'message', (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow || !isResizeMessage(event.data)) {
        return
      }

      const clampedHeight = Math.min(Math.max(event.data.height, 50), 10000)
      if (Math.abs(clampedHeight - currentHeight) > 2) {
        currentHeight = clampedHeight
        iframe.style.setProperty('height', `${clampedHeight}px`)
      }
    })
  }

  private renderError(error: unknown): void {
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    const errorDiv = this.containerEl.createDiv({
      cls: 'html-renderer-error',
    })
    errorDiv.textContent = message
  }
}
