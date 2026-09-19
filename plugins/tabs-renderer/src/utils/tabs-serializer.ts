export function calculateBackquoteCount(doc: string, minCount = 3): number {
  let maxCount = minCount
  let count = 0

  for (let i = 0; i < doc.length; i++) {
    const char = doc[i]
    if (char === '`' || char === '~') {
      count++
      maxCount = Math.max(maxCount, count)
    } else {
      count = 0
    }
  }

  return maxCount
}

export function serializeTabs(
  tabs: readonly { readonly title: string; readonly content: string }[],
  split: string,
  rawConfig = '',
  backquoteChar: '`' | '~' = '`',
  minBackquoteCount = 3
): string {
  let tabsBody = ''
  for (const tab of tabs) {
    tabsBody += `${split}${tab.title}\n${tab.content}`
  }

  const fullContent = rawConfig ? `${rawConfig.trim()}\n${tabsBody}` : tabsBody
  const innerMax = calculateBackquoteCount(fullContent, 0)
  const backquoteCount = innerMax >= minBackquoteCount ? innerMax + 1 : minBackquoteCount
  const fence = backquoteChar.repeat(backquoteCount)
  const configPrefix = rawConfig.trim() ? `${rawConfig.trim()}\n` : ''

  return `${fence}tabs-renderer\n${configPrefix}${tabsBody}${fence}`
}
