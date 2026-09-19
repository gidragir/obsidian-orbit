export interface TabsConfigOptions {
  readonly titlePosition: 'top' | 'bottom' | 'left' | 'right'
  readonly titleLineClamp: 'one' | 'multi'
  readonly actionButton: 'action-add' | 'action-edit' | 'action-none'
}

export function parseConfig(
  rawConfig: string,
  defaultOptions: TabsConfigOptions
): TabsConfigOptions {
  let titlePosition = defaultOptions.titlePosition
  let titleLineClamp = defaultOptions.titleLineClamp
  let actionButton = defaultOptions.actionButton

  const lines = rawConfig.trim().toLowerCase().split('\n')
  for (const line of lines) {
    const tokens = line.split(',')
    for (const rawToken of tokens) {
      const token = rawToken.trim()
      switch (token) {
        case 'top':
        case 'bottom':
        case 'left':
        case 'right':
          titlePosition = token
          break
        case 'one':
        case 'multi':
          titleLineClamp = token
          break
        case 'action-add':
        case 'action-edit':
        case 'action-none':
          actionButton = token
          break
        default:
          break
      }
    }
  }

  return { titlePosition, titleLineClamp, actionButton }
}
