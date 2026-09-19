import { describe, expect, it } from 'vitest'
import { createCodeBlock, getFormattedContent } from './text-format'

describe('createCodeBlock', () => {
  it('wraps code with triple backticks when no inner fences exist', () => {
    const result = createCodeBlock('const x = 1;', 'ts')
    expect(result).toBe('```ts\nconst x = 1;\n```')
  })

  it('increases backticks when inner code has backticks', () => {
    const result = createCodeBlock('```\ninner\n```', 'markdown')
    expect(result).toBe('````markdown\n```\ninner\n```\n````')
  })
})

describe('getFormattedContent', () => {
  it('wraps string with format tokens if not formatted', () => {
    expect(getFormattedContent('hello', '**')).toBe('**hello**')
  })

  it('unwraps string if already formatted', () => {
    expect(getFormattedContent('**hello**', '**')).toBe('hello')
  })

  it('supports custom tail', () => {
    expect(getFormattedContent('text', '==', '==')).toBe('==text==')
    expect(getFormattedContent('==text==', '==', '==')).toBe('text')
  })
})
