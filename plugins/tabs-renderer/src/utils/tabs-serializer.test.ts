import { describe, expect, it } from 'vitest'
import { parseTabs } from './tabs-parser'
import { calculateBackquoteCount, serializeTabs } from './tabs-serializer'

describe('calculateBackquoteCount', () => {
  it('returns minCount when no backticks exist', () => {
    expect(calculateBackquoteCount('hello world', 3)).toBe(3)
  })

  it('finds maximum consecutive backticks or tildes', () => {
    expect(calculateBackquoteCount('```tabs-renderer\ncontent\n```', 3)).toBe(3)
    expect(calculateBackquoteCount('````tabs-renderer\ncontent\n````', 3)).toBe(4)
    expect(calculateBackquoteCount('~~~~~tabs-renderer', 3)).toBe(5)
  })
})

describe('serializeTabs', () => {
  it('serializes tabs with rawConfig', () => {
    const tabs = [
      { title: 'Tab 1', content: 'Content 1\n' },
      { title: 'Tab 2', content: 'Content 2\n' },
    ]
    const result = serializeTabs(tabs, 'tab: ', 'top, one')
    expect(result).toBe(
      '```tabs-renderer\ntop, one\ntab: Tab 1\nContent 1\ntab: Tab 2\nContent 2\n```'
    )
  })

  it('increases backticks when content contains code fences', () => {
    const tabs = [{ title: 'Code', content: '```js\nconsole.log(1)\n```\n' }]
    const result = serializeTabs(tabs, 'tab: ')
    expect(result.startsWith('````tabs-renderer\n')).toBe(true)
    expect(result.endsWith('````')).toBe(true)
  })

  it('supports tildes fence', () => {
    const tabs = [{ title: 'Tab', content: 'Simple\n' }]
    const result = serializeTabs(tabs, 'tab: ', '', '~')
    expect(result).toBe('~~~tabs-renderer\ntab: Tab\nSimple\n~~~')
  })

  it('is idempotent across parse and serialize cycles without accumulating newlines or backticks', () => {
    const initial = '```tabs-renderer\ntab: Tab 1\nLine 1\nLine 2\ntab: Tab 2\nLine 3\n```'
    const parsed1 = parseTabs(
      initial.replace(/^```tabs-renderer\n/, '').replace(/\n```$/, ''),
      'tab: '
    )
    const serialized1 = serializeTabs(parsed1.tabs, 'tab: ', parsed1.rawConfig)
    expect(serialized1).toBe(initial)

    const parsed2 = parseTabs(
      serialized1.replace(/^```tabs-renderer\n/, '').replace(/\n```$/, ''),
      'tab: '
    )
    const serialized2 = serializeTabs(parsed2.tabs, 'tab: ', parsed2.rawConfig)
    expect(serialized2).toBe(initial)
  })
})
