import { describe, expect, it } from 'vitest'
import { HTMLDocumentBuilder } from './document-builder'

describe('HTMLDocumentBuilder', () => {
  it('builds basic document without theme or auto-resize', () => {
    const html = new HTMLDocumentBuilder()
      .setHtmlContent('<h1>Hello</h1>')
      .withThemeStyles(false)
      .withAutoResizeScript(false)
      .build()

    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('<div id="html-renderer-root">\n<h1>Hello</h1>\n</div>')
    expect(html).not.toContain('--bg-color')
    expect(html).not.toContain('sendHeight')
  })

  it('builds document with theme tokens when theme is enabled', () => {
    const tokens = {
      bgColor: '#123456',
      textColor: '#abcdef',
      fontFamily: 'CustomFont',
    }

    const html = new HTMLDocumentBuilder()
      .setHtmlContent('<div>Themed</div>')
      .withThemeStyles(true)
      .withThemeTokens(tokens)
      .build()

    expect(html).toContain('--bg-color: #123456;')
    expect(html).toContain('--text-color: #abcdef;')
    expect(html).toContain('--font-family: CustomFont;')
  })

  it('falls back to default colors when theme tokens are null', () => {
    const html = new HTMLDocumentBuilder()
      .setHtmlContent('<div>Fallback</div>')
      .withThemeStyles(true)
      .withThemeTokens(null)
      .build()

    expect(html).toContain('--bg-color: #ffffff;')
    expect(html).toContain('--text-color: #000000;')
    expect(html).toContain('--font-family: sans-serif;')
  })

  it('injects auto resize script when enabled', () => {
    const html = new HTMLDocumentBuilder()
      .setHtmlContent('<p>Resize</p>')
      .withAutoResizeScript(true)
      .build()

    expect(html).toContain('html-renderer-resize')
    expect(html).toContain('window.parent.postMessage')
  })
})
