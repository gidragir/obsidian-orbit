import { defaultKeymap, historyKeymap, redo, undo } from '@codemirror/commands'
import type { KeyBinding } from '@codemirror/view'

export function createEditorKeymaps(tabSize: number, onSave?: () => void): readonly KeyBinding[] {
  return [
    {
      key: 'Mod-z',
      run: (editor) => undo(editor),
      preventDefault: true,
    },
    {
      key: 'Mod-y',
      mac: 'Mod-Shift-z',
      run: (editor) => redo(editor),
      preventDefault: true,
    },
    {
      linux: 'Ctrl-Shift-z',
      run: (editor) => redo(editor),
      preventDefault: true,
    },
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
    ...adaptKeymaps(historyKeymap),
    ...adaptKeymaps(defaultKeymap),
  ]
}

function adaptSingleBinding(item: Record<string, unknown>): KeyBinding {
  const binding: KeyBinding = {}
  if (typeof item.key === 'string') binding.key = item.key
  if (typeof item.mac === 'string') binding.mac = item.mac
  if (typeof item.win === 'string') binding.win = item.win
  if (typeof item.linux === 'string') binding.linux = item.linux
  if (item.preventDefault === true) binding.preventDefault = true

  if (typeof item.run === 'function') {
    const runFn = item.run as (target: unknown) => boolean
    binding.run = (editor) => runFn(editor)
  }
  if (typeof item.shift === 'function') {
    const shiftFn = item.shift as (target: unknown) => boolean
    binding.shift = (editor) => shiftFn(editor)
  }
  return binding
}

function adaptKeymaps(bindings: readonly unknown[]): readonly KeyBinding[] {
  const result: KeyBinding[] = []
  for (const b of bindings) {
    if (typeof b === 'object' && b !== null) {
      result.push(adaptSingleBinding(b as Record<string, unknown>))
    }
  }
  return result
}
