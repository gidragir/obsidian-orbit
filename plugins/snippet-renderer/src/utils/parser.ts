export interface ParsedTemplate {
  readonly language: string
  readonly cleanSource: string
}

function createVariableRegex(): RegExp {
  return /\$\{([A-Za-z_][A-Za-z0-9_]*)\}|\$([A-Za-z_][A-Za-z0-9_]*)/g
}

export function parseLanguageAndSource(source: string, fenceHeader?: string): ParsedTemplate {
  if (fenceHeader) {
    const headerMatch = fenceHeader.match(
      /snippet-renderer(?::|\s+)+(?:lang[:=])?([a-zA-Z0-9_-]+)/i
    )
    if (headerMatch?.[1]) {
      return {
        language: headerMatch[1],
        cleanSource: source,
      }
    }
  }

  const lines = source.split('\n')
  const firstLine = lines[0]?.trim() ?? ''
  const inlineMatch = firstLine.match(/^(?:#|\/\/|\/\*|<!--)?\s*lang:\s*([a-zA-Z0-9_-]+)/i)

  if (inlineMatch?.[1]) {
    return {
      language: inlineMatch[1],
      cleanSource: lines.slice(1).join('\n'),
    }
  }

  return {
    language: 'bash',
    cleanSource: source,
  }
}

export function extractVariables(source: string): readonly string[] {
  const vars = new Set<string>()
  const regex = createVariableRegex()
  let match: RegExpExecArray | null = regex.exec(source)

  while (match !== null) {
    const varName = match[1] ?? match[2]
    if (varName) {
      vars.add(varName)
    }
    match = regex.exec(source)
  }

  return Array.from(vars)
}

export function substituteVariables(
  source: string,
  values: Readonly<Record<string, string>>
): string {
  const regex = createVariableRegex()
  return source.replace(
    regex,
    (fullMatch: string, braceVar: string | undefined, simpleVar: string | undefined) => {
      const varName = braceVar ?? simpleVar ?? ''
      const userVal = values[varName]

      if (userVal !== undefined && userVal !== '') {
        return userVal
      }

      return fullMatch
    }
  )
}
