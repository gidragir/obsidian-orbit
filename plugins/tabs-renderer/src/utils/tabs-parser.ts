export interface ParsedTab {
  readonly title: string
  readonly content: string
}

export interface ParsedTabsResult {
  readonly rawConfig: string
  readonly tabs: readonly ParsedTab[]
}

function updateInnerTabsDepth(line: string, currentDepth: number): number {
  const trimmed = line.trim()
  const tag = 'tabs-renderer'
  if (trimmed.startsWith('```')) {
    if (currentDepth === 0 && trimmed.endsWith(tag)) {
      return trimmed.length - tag.length
    }
    if (currentDepth > 0 && trimmed.endsWith('`'.repeat(currentDepth))) {
      return 0
    }
  } else if (trimmed.startsWith('~~~')) {
    if (currentDepth === 0 && trimmed.endsWith(tag)) {
      return trimmed.length - tag.length
    }
    if (currentDepth > 0 && trimmed.endsWith('~'.repeat(currentDepth))) {
      return 0
    }
  }
  return currentDepth
}

export function parseTabs(
  source: string,
  split: string,
  defaultTabNavItem = 'Tab 1',
  defaultTabContent = 'Tab 1 content'
): ParsedTabsResult {
  if (!source.includes(split)) {
    return {
      rawConfig: '',
      tabs: [
        {
          title: defaultTabNavItem,
          content: source.trim() === '' ? defaultTabContent : source,
        },
      ],
    }
  }

  const lines = source.split('\n')
  let rawConfig = ''
  let currentTitle = ''
  let currentContent = ''
  let innerTabs = 0
  let isFirst = true
  const tabs: ParsedTab[] = []

  for (const line of lines) {
    if (innerTabs === 0 && line.startsWith(split)) {
      if (isFirst) {
        rawConfig = currentContent
        isFirst = false
      } else {
        tabs.push({ title: currentTitle, content: currentContent })
      }
      currentTitle = line.substring(split.length)
      currentContent = ''
    } else {
      currentContent += `${line}\n`
      innerTabs = updateInnerTabsDepth(line, innerTabs)
    }
  }

  if (!isFirst) {
    tabs.push({ title: currentTitle, content: currentContent })
  }

  return {
    rawConfig,
    tabs,
  }
}
