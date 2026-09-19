import { describe, expect, it } from 'vitest'
import { parseTaskTag } from './parser'

describe('parseTaskTag', () => {
  it('parses valid task tag with known priority', () => {
    const result = parseTaskTag('Do this #task/urgent now')
    expect(result).toEqual({
      raw: '#task/urgent',
      tag: 'urgent',
      priority: 1,
    })
  })

  it('defaults priority to 3 for unknown tag', () => {
    const result = parseTaskTag('Notes with #task/custom-tag here')
    expect(result).toEqual({
      raw: '#task/custom-tag',
      tag: 'custom-tag',
      priority: 3,
    })
  })

  it('returns null when no task tag is present', () => {
    expect(parseTaskTag('Just a regular line of markdown')).toBeNull()
  })
})
