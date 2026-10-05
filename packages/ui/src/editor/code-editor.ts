import { history } from '@codemirror/commands'
import { html } from '@codemirror/lang-html'
import { markdown } from '@codemirror/lang-markdown'
import { EditorState, type Extension } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { createEditorKeymaps } from './editor-keymaps'
import { baseHighlight, baseTheme } from './editor-theme'
import { EditorToolbar, type EditorToolbarOptions } from './editor-toolbar'

export interface CodeEditorOptions {
  readonly language?: 'markdown' | 'html'
  readonly tabSize?: number
  readonly showToolbar?: boolean
  readonly toolbarOptions?: EditorToolbarOptions
  readonly onSave?: () => void
  readonly onDocChange?: (doc: string) => void
}

export class CodeEditor {
  readonly view: EditorView
  private lastEditTime = 0
  private hasDocChanged = false

  constructor(containerEl: HTMLElement, initialDoc: string, options?: CodeEditorOptions) {
    const opts = options ?? {}
    const tabSize = opts.tabSize ?? 4
    const showToolbar = opts.showToolbar ?? true

    const editorWrapper = containerEl.createDiv({ cls: 'orbit-editor-wrapper' })

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        this.lastEditTime = Date.now()
        this.hasDocChanged = true
        opts.onDocChange?.(this.getDoc())
      }
    })

    const langExtension: Extension = opts.language === 'html' ? html() : markdown()

    const state = EditorState.create({
      doc: initialDoc,
      extensions: [
        baseTheme,
        baseHighlight,
        langExtension,
        history(),
        keymap.of(createEditorKeymaps(tabSize, opts.onSave)),
        updateListener,
      ],
    })

    const editorContainer = editorWrapper.createDiv({ cls: 'orbit-editor' })

    this.view = new EditorView({
      state,
      parent: editorContainer,
      extensions: [EditorView.lineWrapping],
    })

    if (showToolbar) {
      const toolbarWrapper = editorWrapper.createDiv()
      new EditorToolbar(toolbarWrapper, this.view, opts.toolbarOptions)
      editorWrapper.prepend(toolbarWrapper)
    }
  }

  getDoc(): string {
    return this.view.state.doc.toString()
  }

  get hasChanges(): boolean {
    return this.hasDocChanged
  }

  get lastEdited(): number {
    return this.lastEditTime
  }

  markSaved(): void {
    this.hasDocChanged = false
  }

  destroy(): void {
    this.view.destroy()
  }
}
