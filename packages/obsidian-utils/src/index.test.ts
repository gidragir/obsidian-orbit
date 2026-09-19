import { describe, expect, it } from 'vitest'
import { formatWikiLink, parseKeyValueFrontmatter, parseWikiLink, sanitizeFileName } from './index'

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
})
