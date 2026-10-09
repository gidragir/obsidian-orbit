import { markdown } from '@codemirror/lang-markdown'
import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

export interface PanelEditorOptions {
  readonly initialContent: string
  readonly containerEl: HTMLElement
  readonly onContentChange: (newContent: string) => void
}

export class PanelEditor {
  private view: EditorView | null = null

  constructor(options: PanelEditorOptions) {
    this.initEditor(options)
  }

  private initEditor(options: PanelEditorOptions): void {
    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        options.onContentChange(update.state.doc.toString())
      }
    })

    const editorTheme = EditorView.theme({
      '&': {
        height: '100%',
        backgroundColor: 'transparent',
        color: 'var(--text-normal)',
      },
      '.cm-scroller': {
        overflowY: 'auto !important',
        fontFamily: 'var(--font-text)',
      },
      '.cm-content': {
        fontFamily: 'var(--font-text)',
        fontSize: 'var(--font-text-size)',
        lineHeight: 'var(--line-height-normal)',
        padding: '12px 16px',
        caretColor: 'var(--text-normal)',
      },
      '&.cm-focused': {
        outline: 'none',
      },
    })

    const state = EditorState.create({
      doc: options.initialContent,
      extensions: [
        markdown(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        editorTheme,
        EditorView.lineWrapping,
        updateListener,
      ],
    })

    this.view = new EditorView({
      state,
      parent: options.containerEl,
    })
  }

  getContent(): string {
    return this.view ? this.view.state.doc.toString() : ''
  }

  focus(): void {
    if (this.view) {
      this.view.focus()
    }
  }

  destroy(): void {
    if (this.view) {
      this.view.destroy()
      this.view = null
    }
  }
}
