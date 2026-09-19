export function createCodeBlock(code: string, language = ''): string {
  let backquoteNum = 3
  let count = 0
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '`' || code[i] === '~') {
      count++
      backquoteNum = Math.max(backquoteNum, count + 1)
    } else {
      count = 0
    }
  }
  const fence = '`'.repeat(backquoteNum)
  return `${fence}${language}\n${code}\n${fence}`
}

export function getFormattedContent(rowStr: string, format: string, tail?: string): string {
  const actualTail = tail ?? format
  const minLength = format.length + actualTail.length

  if (rowStr.length <= minLength) {
    return `${format}${rowStr}${actualTail}`
  }

  if (rowStr.startsWith(format) && rowStr.endsWith(actualTail)) {
    return rowStr.substring(format.length, rowStr.length - actualTail.length)
  }

  return `${format}${rowStr}${actualTail}`
}
