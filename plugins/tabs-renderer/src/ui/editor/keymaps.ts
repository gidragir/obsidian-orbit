import type { KeyBinding } from '@codemirror/view'

export function createBasicKeymaps(tabSize: number, onSave?: () => void): readonly KeyBinding[] {
  return [
    {
      key: '$',
      run: (editor) => {
        const { from, to } = editor.state.selection.main
        const selected = editor.state.doc.sliceString(from, to)
        editor.dispatch({
          changes: { from, to, insert: `$${selected}$` },
        })
        return true
      },
    },
    {
      key: '[',
      run: (editor) => {
        const { from, to, anchor, head } = editor.state.selection.main
        const selected = editor.state.doc.sliceString(from, to)
        editor.dispatch({
          changes: { from, to, insert: `[${selected}]` },
          selection: { anchor: anchor + 1, head: head + 1 },
        })
        return true
      },
    },
    {
      key: '{',
      run: (editor) => {
        const { from, to, anchor, head } = editor.state.selection.main
        const selected = editor.state.doc.sliceString(from, to)
        editor.dispatch({
          changes: { from, to, insert: `{${selected}}` },
          selection: { anchor: anchor + 1, head: head + 1 },
        })
        return true
      },
    },
    {
      key: 'Tab',
      run: (editor) => {
        const { from, to } = editor.state.selection.main
        const fromLine = editor.state.doc.lineAt(from)
        const toLine = editor.state.doc.lineAt(to)
        const indent = ' '.repeat(tabSize)

        let newText = indent + fromLine.text
        for (let i = fromLine.number + 1; i <= toLine.number; i++) {
          newText += `\n${indent}${editor.state.doc.line(i).text}`
        }

        editor.dispatch({
          changes: { from: fromLine.from, to: toLine.to, insert: newText },
        })
        return true
      },
    },
    {
      key: 'Mod-s',
      run: () => {
        onSave?.()
        return true
      },
    },
    {
      key: 'Mod-Enter',
      run: () => {
        onSave?.()
        return true
      },
    },
  ]
}
