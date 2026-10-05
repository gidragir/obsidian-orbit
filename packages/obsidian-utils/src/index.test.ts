import { describe, expect, it } from 'vitest'
import {
  formatCodeBlock,
  formatWikiLink,
  parseKeyValueFrontmatter,
  parseWikiLink,
  sanitizeFileName,
} from './index'

describe('obsidian-utils pure domain functions', () => {
  describe('formatWikiLink', () => {
    it('formats a wiki link without alias', () => {
      expect(formatWikiLink('My Note')).toBe('[[My Note]]')
    })

    it('formats a wiki link with alias', () => {
      expect(formatWikiLink('My Note', 'Display Name')).toBe('[[My Note|Display Name]]')
    })

    it('trims whitespace properly', () => {
      expect(formatWikiLink('  My Note  ', '  Alias  ')).toBe('[[My Note|Alias]]')
    })
  })

  describe('parseWikiLink', () => {
    it('parses wiki link without alias', () => {
      const parsed = parseWikiLink('[[My Note]]')
      expect(parsed).toEqual({ target: 'My Note', alias: null })
    })

    it('parses wiki link with alias', () => {
      const parsed = parseWikiLink('[[My Note|Custom Alias]]')
      expect(parsed).toEqual({ target: 'My Note', alias: 'Custom Alias' })
    })

    it('returns null for invalid wiki links', () => {
      expect(parseWikiLink('not a link')).toBeNull()
      expect(parseWikiLink('[[]]')).toBeNull()
    })
  })

  describe('sanitizeFileName', () => {
    it('removes illegal characters', () => {
      expect(sanitizeFileName('file:name/test?*.md')).toBe('file-name-test--.md')
    })

    it('preserves clean file names', () => {
      expect(sanitizeFileName('clean-filename.md')).toBe('clean-filename.md')
    })
  })

  describe('parseKeyValueFrontmatter', () => {
    it('parses valid key-value pairs', () => {
      const yaml = 'title: Hello World\ntags: obsidian\nstatus: active'
      const parsed = parseKeyValueFrontmatter(yaml)
      expect(parsed).toEqual({
        title: 'Hello World',
        tags: 'obsidian',
        status: 'active',
      })
    })

    it('ignores empty lines and comments', () => {
      const yaml = '# Comment\nkey: value\n\n# Another comment'
      const parsed = parseKeyValueFrontmatter(yaml)
      expect(parsed).toEqual({ key: 'value' })
    })
  })

  describe('formatCodeBlock', () => {
    it('formats a basic code block with 3 backticks', () => {
      const result = formatCodeBlock('html-renderer', '<div>Hello</div>')
      expect(result).toBe('```html-renderer\n<div>Hello</div>\n```')
    })

    it('trims trailing whitespace/newlines from content before closing fence', () => {
      const result = formatCodeBlock('html-renderer', '<div>Hello</div>\n\n  \n')
      expect(result).toBe('```html-renderer\n<div>Hello</div>\n```')
    })

    it('handles empty content', () => {
      const result = formatCodeBlock('html-renderer', '')
      expect(result).toBe('```html-renderer\n```')
    })

    it('expands backticks if content contains 3 backticks', () => {
      const result = formatCodeBlock('tabs-renderer', '```js\nconsole.log(1)\n```')
      expect(result).toBe('````tabs-renderer\n```js\nconsole.log(1)\n```\n````')
    })

    it('supports tilde fence', () => {
      const result = formatCodeBlock('tabs-renderer', 'test', '~')
      expect(result).toBe('~~~tabs-renderer\ntest\n~~~')
    })
  })
})
