import { html } from '@codemirror/lang-html'
import { markdown } from '@codemirror/lang-markdown'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { createBasicKeymaps } from './keymaps'
import { baseHighlight, baseTheme } from './tab-editor-style'
import { EditorToolbar } from './toolbar'

export class TabEditor {
  readonly view: EditorView
  private lastEditTime = 0
  private hasDocChanged = false

  constructor(
    containerEl: HTMLElement,
    initialDoc: string,
    tabSize: number,
    showToolbar: boolean,
    onSave?: () => void,
    onDocChange?: (doc: string) => void
  ) {
    const editorWrapper = containerEl.createDiv({ cls: 'tabs-editor-wrapper' })

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        this.lastEditTime = Date.now()
        this.hasDocChanged = true
        onDocChange?.(this.getDoc())
      }
    })

    const state = EditorState.create({
      doc: initialDoc,
      extensions: [
        baseTheme,
        baseHighlight,
        markdown(),
        html(),
        keymap.of(createBasicKeymaps(tabSize, onSave)),
        updateListener,
      ],
    })

    if (showToolbar) {
      // Toolbar will use a proxy/reference to this.view once created
    }

    const editorContainer = editorWrapper.createDiv({ cls: 'tabs-editor' })

    this.view = new EditorView({
      state,
      parent: editorContainer,
      extensions: [EditorView.lineWrapping],
    })

    if (showToolbar) {
      const toolbarWrapper = editorWrapper.createDiv()
      new EditorToolbar(toolbarWrapper, this.view)
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
