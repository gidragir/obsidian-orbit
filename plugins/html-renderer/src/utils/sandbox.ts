export interface SandboxOptions {
  readonly allowScripts: boolean
  readonly allowForms: boolean
  readonly allowPopups: boolean
  readonly allowModals: boolean
}

export function buildSandboxFlags(options: SandboxOptions): string {
  const flags: string[] = ['allow-same-origin']
  if (options.allowScripts) flags.push('allow-scripts')
  if (options.allowForms) flags.push('allow-forms')
  if (options.allowPopups) flags.push('allow-popups')
  if (options.allowModals) flags.push('allow-modals')
  return flags.join(' ')
}
