import { describe, expect, it } from 'vitest'
import { getBasename, getDirname, getExtension, joinPaths, normalizePath } from './path'

describe('normalizePath', () => {
  it('handles empty or whitespace strings', () => {
    expect(normalizePath('')).toBe('')
    expect(normalizePath('   ')).toBe('')
  })

  it('replaces backslashes with forward slashes', () => {
    expect(normalizePath('folder\\subfolder\\file.md')).toBe('folder/subfolder/file.md')
  })

  it('collapses consecutive slashes', () => {
    expect(normalizePath('folder///subfolder//file.md')).toBe('folder/subfolder/file.md')
  })

  it('resolves relative dot segments', () => {
    expect(normalizePath('a/./b/../c')).toBe('a/c')
    expect(normalizePath('a/b/../../c')).toBe('c')
  })

  it('preserves leading slash for absolute paths', () => {
    expect(normalizePath('/a/b/../c')).toBe('/a/c')
    expect(normalizePath('/root/folder/')).toBe('/root/folder')
  })

  it('handles parent segments on relative paths safely', () => {
    expect(normalizePath('../a/b')).toBe('../a/b')
  })
})

describe('joinPaths', () => {
  it('returns empty string when no segments provided', () => {
    expect(joinPaths()).toBe('')
    expect(joinPaths('  ', '')).toBe('')
  })

  it('joins multiple segments into normalized path', () => {
    expect(joinPaths('folder', 'sub', 'file.md')).toBe('folder/sub/file.md')
    expect(joinPaths('folder/', '/sub/', 'file.md')).toBe('folder/sub/file.md')
  })
})

describe('getBasename', () => {
  it('extracts filename from path', () => {
    expect(getBasename('folder/sub/file.md')).toBe('file.md')
    expect(getBasename('file.md')).toBe('file.md')
  })

  it('strips extension when requested', () => {
    expect(getBasename('folder/file.md', true)).toBe('file')
    expect(getBasename('file.notes.md', true)).toBe('file.notes')
  })

  it('handles files without extension or dotfiles', () => {
    expect(getBasename('LICENSE', true)).toBe('LICENSE')
    expect(getBasename('.gitignore', true)).toBe('.gitignore')
  })
})

describe('getExtension', () => {
  it('extracts file extension without dot', () => {
    expect(getExtension('file.md')).toBe('md')
    expect(getExtension('folder/file.test.ts')).toBe('ts')
  })

  it('returns empty string for files without extension', () => {
    expect(getExtension('folder/LICENSE')).toBe('')
    expect(getExtension('.gitignore')).toBe('')
  })
})

describe('getDirname', () => {
  it('extracts directory path', () => {
    expect(getDirname('a/b/c.md')).toBe('a/b')
    expect(getDirname('/a/b/c.md')).toBe('/a/b')
  })

  it('returns empty string or root for root-level files', () => {
    expect(getDirname('file.md')).toBe('')
    expect(getDirname('/file.md')).toBe('/')
  })
})
