import { describe, expect, it } from 'vitest'
import { extractFenceHeader } from './fence'

describe('extractFenceHeader', () => {
  it('extracts header at given line number', () => {
    const text = 'line0\n```script-template python\nline2'
    expect(extractFenceHeader(text, 1)).toBe('```script-template python')
  })

  it('returns empty string if lineStart is out of bounds or negative', () => {
    const text = 'line0\nline1'
    expect(extractFenceHeader(text, -1)).toBe('')
    expect(extractFenceHeader(text, 5)).toBe('')
  })
})
