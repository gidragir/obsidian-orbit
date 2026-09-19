import { describe, expect, it } from 'vitest'
import { parseConfig } from './config-parser'

describe('parseConfig', () => {
  const defaultOptions = {
    titlePosition: 'top' as const,
    titleLineClamp: 'one' as const,
    actionButton: 'action-none' as const,
  }

  it('keeps default options when config is empty', () => {
    const result = parseConfig('', defaultOptions)
    expect(result).toEqual(defaultOptions)
  })

  it('parses valid position, clamp, and action', () => {
    const result = parseConfig('left, multi, action-add', defaultOptions)
    expect(result).toEqual({
      titlePosition: 'left',
      titleLineClamp: 'multi',
      actionButton: 'action-add',
    })
  })

  it('parses multi-line config tokens', () => {
    const raw = `bottom
action-edit
one`
    const result = parseConfig(raw, defaultOptions)
    expect(result).toEqual({
      titlePosition: 'bottom',
      titleLineClamp: 'one',
      actionButton: 'action-edit',
    })
  })

  it('ignores unknown tokens', () => {
    const result = parseConfig('unknown, right, custom', defaultOptions)
    expect(result).toEqual({
      titlePosition: 'right',
      titleLineClamp: 'one',
      actionButton: 'action-none',
    })
  })
})
