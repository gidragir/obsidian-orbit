import { describe, expect, it, vi } from 'vitest'
import { createEditorKeymaps } from './editor-keymaps'

describe('createEditorKeymaps', () => {
  it('triggers onEscape and blurs editor on Escape key', () => {
    const onEscape = vi.fn()
    const keymaps = createEditorKeymaps(4, undefined, onEscape)
    const escapeBinding = keymaps.find((b) => b.key === 'Escape')

    expect(escapeBinding).toBeDefined()

    const blurMock = vi.fn()
    const dummyEditor = {
      contentDOM: {
        blur: blurMock,
      } as unknown as HTMLElement,
    }

    const result = escapeBinding?.run?.(
      dummyEditor as unknown as import('@codemirror/view').EditorView
    )
    expect(result).toBe(true)
    expect(onEscape).toHaveBeenCalledTimes(1)
  })

  it('triggers onSave on Mod-s', () => {
    const onSave = vi.fn()
    const keymaps = createEditorKeymaps(4, onSave)
    const saveBinding = keymaps.find((b) => b.key === 'Mod-s')

    expect(saveBinding).toBeDefined()
    const result = saveBinding?.run?.({} as import('@codemirror/view').EditorView)
    expect(result).toBe(true)
    expect(onSave).toHaveBeenCalledTimes(1)
  })
})
