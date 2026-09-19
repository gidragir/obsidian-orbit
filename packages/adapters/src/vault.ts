import type { IVaultPort } from '@packages/ports'
import type { IFileMeta } from '@packages/types'
import { TFile, type Vault } from 'obsidian'

export class ObsidianVaultAdapter implements IVaultPort {
  private readonly vault: Vault

  constructor(vault: Vault) {
    this.vault = vault
  }

  async read(path: string): Promise<string> {
    const file = this.getFile(path)
    return this.vault.read(file)
  }

  async readBinary(path: string): Promise<ArrayBuffer> {
    const file = this.getFile(path)
    return this.vault.readBinary(file)
  }

  async write(path: string, content: string): Promise<void> {
    const existing = this.vault.getAbstractFileByPath(path)
    if (existing instanceof TFile) {
      await this.vault.modify(existing, content)
      return
    }
    await this.vault.create(path, content)
  }

  async writeBinary(path: string, data: ArrayBuffer): Promise<void> {
    const existing = this.vault.getAbstractFileByPath(path)
    if (existing instanceof TFile) {
      await this.vault.modifyBinary(existing, data)
      return
    }
    await this.vault.createBinary(path, data)
  }

  async append(path: string, content: string): Promise<void> {
    const file = this.getFile(path)
    await this.vault.append(file, content)
  }

  async delete(path: string): Promise<void> {
    const file = this.vault.getAbstractFileByPath(path)
    if (file) {
      await this.vault.delete(file)
    }
  }

  async exists(path: string): Promise<boolean> {
    return this.vault.getAbstractFileByPath(path) !== null
  }

  async list(folderPath?: string): Promise<ReadonlyArray<IFileMeta>> {
    const files = this.vault.getFiles()
    if (!folderPath) {
      return files.map((file) => this.toFileMeta(file))
    }

    const normalizedFolder = folderPath.endsWith('/') ? folderPath : `${folderPath}/`
    return files
      .filter((file) => file.path.startsWith(normalizedFolder))
      .map((file) => this.toFileMeta(file))
  }

  async getMeta(path: string): Promise<IFileMeta | null> {
    const file = this.vault.getAbstractFileByPath(path)
    if (!(file instanceof TFile)) {
      return null
    }
    return this.toFileMeta(file)
  }

  private getFile(path: string): TFile {
    const file = this.vault.getAbstractFileByPath(path)
    if (!(file instanceof TFile)) {
      throw new Error(`File not found or not a valid file: ${path}`)
    }
    return file
  }

  private toFileMeta(file: TFile): IFileMeta {
    return {
      path: file.path,
      name: file.name,
      basename: file.basename,
      extension: file.extension,
      size: file.stat.size,
      mtime: file.stat.mtime,
      ctime: file.stat.ctime,
    }
  }
}

export { ObsidianVaultAdapter as VaultAdapter }
