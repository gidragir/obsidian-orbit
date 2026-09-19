import { describe, expect, it } from 'vitest'
import { resolveSourceType } from './source-parser'

describe('resolveSourceType', () => {
  it('identifies file strategy with quotes', () => {
    const result = resolveSourceType('file: "templates/dashboard.html"')
    expect(result).toEqual({
      type: 'file',
      filePath: 'templates/dashboard.html',
    })
  })

  it('identifies file strategy with single quotes', () => {
    const result = resolveSourceType("file: 'templates/dashboard.html'")
    expect(result).toEqual({
      type: 'file',
      filePath: 'templates/dashboard.html',
    })
  })

  it('identifies file strategy without quotes', () => {
    const result = resolveSourceType('file: templates/dashboard.html')
    expect(result).toEqual({
      type: 'file',
      filePath: 'templates/dashboard.html',
    })
  })

  it('identifies inline strategy for normal html content', () => {
    const html = '<div class="card">Hello</div>'
    const result = resolveSourceType(html)
    expect(result).toEqual({
      type: 'inline',
      content: html,
    })
  })
})
