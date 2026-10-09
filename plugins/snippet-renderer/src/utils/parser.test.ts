import { describe, expect, it } from 'vitest'
import { extractVariables, parseLanguageAndSource, substituteVariables } from './parser'

describe('parseLanguageAndSource', () => {
  it('parses language from fenceHeader with lang: prefix', () => {
    const result = parseLanguageAndSource('echo "hi"', '```snippet-renderer lang:python')
    expect(result).toEqual({
      language: 'python',
      cleanSource: 'echo "hi"',
    })
  })

  it('parses language from fenceHeader without lang: prefix', () => {
    const result = parseLanguageAndSource('echo "hi"', '```snippet-renderer typescript')
    expect(result).toEqual({
      language: 'typescript',
      cleanSource: 'echo "hi"',
    })
  })

  it('parses language from fenceHeader with colon syntax', () => {
    const result = parseLanguageAndSource('echo "hi"', '```snippet-renderer:bash')
    expect(result).toEqual({
      language: 'bash',
      cleanSource: 'echo "hi"',
    })
  })

  it('parses inline language from comments on the first line', () => {
    const sourceHash = '# lang: python\nprint("hello")'
    expect(parseLanguageAndSource(sourceHash)).toEqual({
      language: 'python',
      cleanSource: 'print("hello")',
    })

    const sourceSlash = '// lang: typescript\nconst x = 1;'
    expect(parseLanguageAndSource(sourceSlash)).toEqual({
      language: 'typescript',
      cleanSource: 'const x = 1;',
    })

    const sourceBlock = '/* lang: css */\nbody { color: red; }'
    expect(parseLanguageAndSource(sourceBlock)).toEqual({
      language: 'css',
      cleanSource: 'body { color: red; }',
    })

    const sourceHtml = '<!-- lang: html -->\n<div>hi</div>'
    expect(parseLanguageAndSource(sourceHtml)).toEqual({
      language: 'html',
      cleanSource: '<div>hi</div>',
    })
  })

  it('defaults to bash when no language is specified', () => {
    const source = 'echo "hello world"'
    expect(parseLanguageAndSource(source)).toEqual({
      language: 'bash',
      cleanSource: 'echo "hello world"',
    })
  })

  it('handles empty source gracefully', () => {
    expect(parseLanguageAndSource('')).toEqual({
      language: 'bash',
      cleanSource: '',
    })
  })
})

describe('extractVariables', () => {
  it('extracts simple variables with $VAR syntax', () => {
    const vars = extractVariables('Hello $NAME, your role is $ROLE')
    expect(vars).toEqual(['NAME', 'ROLE'])
  })

  it('extracts braced variables with dollar-brace syntax', () => {
    const vars = extractVariables('Hello ' + '${' + 'NAME}, your role is ' + '${' + 'ROLE}')
    expect(vars).toEqual(['NAME', 'ROLE'])
  })

  it('extracts unique variables avoiding duplicates', () => {
    const vars = extractVariables('$NAME ' + '${' + 'NAME} $NAME')
    expect(vars).toEqual(['NAME'])
  })

  it('returns empty array when no variables exist', () => {
    expect(extractVariables('No variables here $123 $$')).toEqual([])
  })
})

describe('substituteVariables', () => {
  it('substitutes known variables', () => {
    const source = 'echo "Hello $NAME ' + '${' + 'SURNAME}!"'
    const values = {
      NAME: 'John',
      SURNAME: 'Doe',
    }
    const result = substituteVariables(source, values)
    expect(result).toBe('echo "Hello John Doe!"')
  })

  it('keeps original token if value is empty string or undefined', () => {
    const source = 'echo "$FOO ' + '${' + 'BAR} $BAZ"'
    const values = {
      FOO: '',
      BAR: 'filled',
    }
    const result = substituteVariables(source, values)
    expect(result).toBe('echo "$FOO filled $BAZ"')
  })
})
