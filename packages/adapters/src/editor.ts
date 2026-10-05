import type { Editor, MarkdownSectionInformation } from 'obsidian'

interface FenceInfo {
  readonly char: string
  readonly length: number
}

function matchesStart(lineText: string, expectedPrefix?: string): boolean {
  const trimmed = lineText.trimStart()
  return expectedPrefix ? trimmed.startsWith(expectedPrefix) : /^(`{3,}|~{3,})/.test(trimmed)
}

function resolveStartLine(
  editor: Editor,
  hintLine: number,
  lineCount: number,
  expectedPrefix?: string
): number {
  if (
    hintLine >= 0 &&
    hintLine < lineCount &&
    matchesStart(editor.getLine(hintLine) ?? '', expectedPrefix)
  ) {
    return hintLine
  }

  const minSearch = Math.max(0, hintLine - 3)
  const maxSearch = Math.min(lineCount - 1, hintLine + 3)
  for (let l = minSearch; l <= maxSearch; l++) {
    if (matchesStart(editor.getLine(l) ?? '', expectedPrefix)) {
      return l
    }
  }

  return -1
}

function parseFenceInfo(lineText: string): FenceInfo | null {
  const match = /^(`{3,}|~{3,})/.exec(lineText.trimStart())
  if (!match?.[1]) {
    return null
  }
  return {
    char: match[1][0] ?? '`',
    length: match[1].length,
  }
}

function resolveEndLine(
  editor: Editor,
  startLine: number,
  hintEndLine: number,
  fence: FenceInfo,
  lineCount: number
): number {
  const closingRegex = new RegExp(`^${fence.char}{${fence.length},}\\s*$`)
  const searchLimit = Math.min(lineCount - 1, Math.max(hintEndLine + 5, startLine + 5000))

  for (let l = startLine + 1; l <= searchLimit; l++) {
    const lineText = editor.getLine(l) ?? ''
    if (closingRegex.test(lineText.trimStart())) {
      return l
    }
  }

  if (hintEndLine > startLine && hintEndLine < lineCount) {
    return hintEndLine
  }

  return -1
}

/**
 * Safely replaces a Markdown code block in the Obsidian editor.
 * Validates actual start and end lines to ensure fences are matched properly,
 * avoiding leftover fences or duplicated markers.
 */
export function replaceCodeBlock(
  editor: Editor,
  sectionInfo: MarkdownSectionInformation,
  newBlockContent: string,
  expectedFencePrefix?: string
): boolean {
  const lineCount = editor.lineCount()
  const startLine = resolveStartLine(editor, sectionInfo.lineStart, lineCount, expectedFencePrefix)
  if (startLine === -1) {
    return false
  }

  const fence = parseFenceInfo(editor.getLine(startLine) ?? '')
  if (!fence) {
    return false
  }

  const endLine = resolveEndLine(editor, startLine, sectionInfo.lineEnd, fence, lineCount)
  if (endLine === -1) {
    return false
  }

  const endLineLength = editor.getLine(endLine)?.length ?? 0
  editor.replaceRange(
    newBlockContent,
    { line: startLine, ch: 0 },
    { line: endLine, ch: endLineLength }
  )

  return true
}
