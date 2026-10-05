export interface ParsedTab {
  readonly title: string
  readonly content: string
}

export interface ParsedTabsResult {
  readonly rawConfig: string
  readonly tabs: readonly ParsedTab[]
}

interface FenceState {
  readonly char: '`' | '~'
  readonly length: number
}

function parseFenceStart(trimmed: string): FenceState | null {
  const match = /^(`{3,}|~{3,})/.exec(trimmed)
  if (!match?.[1]) {
    return null
  }
  const fenceStr = match[1]
  return {
    char: fenceStr[0] as '`' | '~',
    length: fenceStr.length,
  }
}

function isFenceEnd(trimmed: string, fence: FenceState): boolean {
  if (fence.char === '`') {
    return /^`{3,}$/.test(trimmed) && trimmed.length >= fence.length
  }
  return /^~{3,}$/.test(trimmed) && trimmed.length >= fence.length
}

function updateFenceState(line: string, currentFence: FenceState | null): FenceState | null {
  const trimmed = line.trim()
  if (currentFence === null) {
    return parseFenceStart(trimmed)
  }
  if (isFenceEnd(trimmed, currentFence)) {
    return null
  }
  return currentFence
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
  let currentFence: FenceState | null = null
  let isFirst = true
  const tabs: ParsedTab[] = []

  for (const line of lines) {
    if (currentFence === null && line.startsWith(split)) {
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
      currentFence = updateFenceState(line, currentFence)
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
