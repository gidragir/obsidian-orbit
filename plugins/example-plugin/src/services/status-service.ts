import { formatWikiLink } from '@packages/obsidian-utils'
import { getBadgeClassNames } from '@packages/ui'
import type { App } from 'obsidian'

export class StatusService {
  private readonly app: App

  constructor(app: App) {
    this.app = app
  }

  public getVaultName(): string {
    return this.app.vault.getName()
  }

  public createStatusSummary(): string {
    const vault = this.getVaultName()
    const link = formatWikiLink(vault, 'Current Vault')
    const badge = getBadgeClassNames('success')
    return `${link} (${badge})`
  }
}
