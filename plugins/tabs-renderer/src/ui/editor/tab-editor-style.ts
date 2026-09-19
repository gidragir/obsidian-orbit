import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { tags } from '@lezer/highlight'

export const baseTheme: Extension = EditorView.baseTheme({
  '&': {
    color: 'var(--text-normal)',
    backgroundColor: 'var(--background-primary)',
    outline: 'none',
    height: '100%',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-content': {
    'max-width': '100%',
    'text-wrap': 'wrap',
    outline: 'none',
    'caret-color': 'var(--caret-color)',
  },
  '.cm-content .cm-line': {
    padding: '0 1px',
    'font-family': 'var(--font-text)',
    'line-height': 'var(--line-height-normal)',
    'overflow-wrap': 'break-word',
  },
})

export const baseHighlight: Extension = syntaxHighlighting(
  HighlightStyle.define([
    { tag: tags.heading1, color: 'var(--h1-color, var(--text-normal))' },
    { tag: tags.heading2, color: 'var(--h2-color, var(--text-normal))' },
    { tag: tags.heading3, color: 'var(--h3-color, var(--text-normal))' },
    { tag: tags.strong, fontWeight: 'bold' },
    { tag: tags.emphasis, fontStyle: 'italic' },
    { tag: tags.monospace, color: 'var(--code-normal)' },
  ])
)
