import type { IVaultPort } from '@packages/ports'
import type { SourceStrategy } from '@utils/source-parser'

export class ContentLoader {
  private readonly vault: IVaultPort

  constructor(vault: IVaultPort) {
    this.vault = vault
  }

  async load(strategy: SourceStrategy): Promise<string> {
    if (strategy.type === 'inline') {
      return strategy.content
    }
    return await this.vault.read(strategy.filePath)
  }
}
