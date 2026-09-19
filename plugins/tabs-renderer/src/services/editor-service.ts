import { type App, type Editor, MarkdownView } from 'obsidian'

export class EditorService {
  private readonly app: App

  constructor(app: App) {
    this.app = app
  }

  getActiveEditor(): Editor | null {
    const activeView = this.getActiveMarkdownView()
    return activeView?.editor ?? null
  }

  getActiveMarkdownView(): MarkdownView | null {
    return this.app.workspace.getActiveViewOfType(MarkdownView)
  }

  isPreviewMode(): boolean {
    const activeView = this.getActiveMarkdownView()
    if (!activeView) {
      return false
    }
    const state = activeView.leaf.getViewState()
    const viewState = state.state as Record<string, unknown> | undefined
    return viewState?.mode === 'preview'
  }

  replaceLine(lineIndex: number, text: string): void {
    const editor = this.getActiveEditor()
    if (!editor || lineIndex < 0 || lineIndex > editor.lineCount()) {
      return
    }
    editor.setLine(lineIndex, text)
  }

  replaceSelection(text: string): void {
    const editor = this.getActiveEditor()
    editor?.replaceSelection(text)
  }

  getSelection(): string {
    const editor = this.getActiveEditor()
    return editor?.getSelection() ?? ''
  }
}
