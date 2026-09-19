import { describe, expect, it } from 'vitest'
import { buildSandboxFlags } from './sandbox'

describe('buildSandboxFlags', () => {
  it('builds sandbox flags with all permissions disabled', () => {
    const flags = buildSandboxFlags({
      allowScripts: false,
      allowForms: false,
      allowPopups: false,
      allowModals: false,
    })
    expect(flags).toBe('allow-same-origin')
  })

  it('builds sandbox flags with all permissions enabled', () => {
    const flags = buildSandboxFlags({
      allowScripts: true,
      allowForms: true,
      allowPopups: true,
      allowModals: true,
    })
    expect(flags).toBe('allow-same-origin allow-scripts allow-forms allow-popups allow-modals')
  })

  it('builds sandbox flags with selective permissions', () => {
    const flags = buildSandboxFlags({
      allowScripts: true,
      allowForms: false,
      allowPopups: true,
      allowModals: false,
    })
    expect(flags).toBe('allow-same-origin allow-scripts allow-popups')
  })
})
