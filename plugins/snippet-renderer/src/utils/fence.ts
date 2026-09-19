export function extractFenceHeader(sectionText: string, lineStart: number): string {
  if (lineStart < 0) {
    return ''
  }
  const lines = sectionText.split('\n')
  return lines[lineStart] ?? ''
}
