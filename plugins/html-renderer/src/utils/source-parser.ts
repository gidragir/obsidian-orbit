export type SourceStrategy =
  | { readonly type: 'file'; readonly filePath: string }
  | { readonly type: 'inline'; readonly content: string }

export function resolveSourceType(source: string): SourceStrategy {
  const trimmed = source.trim()
  const fileMatch = trimmed.match(/^file:\s*["']?([^"'\n]+)["']?\s*$/i)

  if (fileMatch?.[1]) {
    return {
      type: 'file',
      filePath: fileMatch[1].trim(),
    }
  }

  return {
    type: 'inline',
    content: trimmed,
  }
}
