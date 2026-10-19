import type { ObsidianStorageAdapter } from '@adapters/obsidian-storage-adapter'
import { extractOverlayDiff, prepareEffectiveData, resolveStoragePaths } from '@core/shadow-storage'
import type { PlatformType, PluginProfileConfig, SyncMode } from '@core/types'
import { Plugin } from 'obsidian'

export class ShadowStorageService {
  private readonly storageAdapter: ObsidianStorageAdapter
  private originalSaveData: ((data: unknown) => Promise<void>) | null = null
  private originalLoadData: (() => Promise<unknown>) | null = null
  private areHooksInstalled = false

  constructor(storageAdapter: ObsidianStorageAdapter) {
    this.storageAdapter = storageAdapter
  }

  installHooks(
    getPluginConfig: (pluginId: string) => PluginProfileConfig | undefined,
    platform: PlatformType
  ): void {
    if (this.areHooksInstalled) {
      return
    }

    const self = this
    this.originalSaveData = Plugin.prototype.saveData
    this.originalLoadData = Plugin.prototype.loadData

    const origSave = this.originalSaveData
    const origLoad = this.originalLoadData

    Plugin.prototype.saveData = async function (this: Plugin, data: unknown): Promise<void> {
      const pluginId = this.manifest.id
      const config = getPluginConfig(pluginId)

      if (config && config.syncMode !== 'bidirectional') {
        if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
          await self.persistPluginStorage(
            pluginId,
            config.syncMode,
            platform,
            data as Record<string, unknown>
          )
          return
        }
      }

      await origSave.call(this, data)
    }

    Plugin.prototype.loadData = async function (this: Plugin): Promise<unknown> {
      const pluginId = this.manifest.id
      const config = getPluginConfig(pluginId)

      if (config && config.syncMode !== 'bidirectional') {
        const effective = await self.loadEffectiveData(pluginId, config.syncMode, platform)
        if (effective !== null) {
          return effective
        }
      }

      return await origLoad.call(this)
    }

    this.areHooksInstalled = true
  }

  async loadEffectiveData(
    pluginId: string,
    syncMode: SyncMode,
    platform: PlatformType
  ): Promise<Record<string, unknown> | null> {
    const paths = resolveStoragePaths(pluginId, syncMode, platform)

    if (syncMode === 'isolated') {
      const isolatedData = await this.storageAdapter.readJson(paths.isolatedPath)
      if (isolatedData !== null) {
        return isolatedData
      }
      return await this.storageAdapter.readJson(paths.cloudPath)
    }

    if (syncMode === 'from-cloud') {
      const cloudData = await this.storageAdapter.readJson(paths.cloudPath)
      const localData = await this.storageAdapter.readJson(paths.overlayPath)
      return prepareEffectiveData('from-cloud', cloudData, localData)
    }

    return await this.storageAdapter.readJson(paths.cloudPath)
  }

  private async prepareFromCloud(paths: ReturnType<typeof resolveStoragePaths>): Promise<void> {
    const cloudData = await this.storageAdapter.readJson(paths.cloudPath)
    if (cloudData !== null) {
      await this.storageAdapter.writeJson(paths.cloudBackupPath, cloudData)
    }
    const localData = await this.storageAdapter.readJson(paths.overlayPath)
    const effectiveData = prepareEffectiveData('from-cloud', cloudData, localData)

    if (localData !== null) {
      await this.storageAdapter.writeJson(paths.cloudPath, effectiveData)
    }
  }

  private async prepareToCloud(paths: ReturnType<typeof resolveStoragePaths>): Promise<void> {
    const cloudData = await this.storageAdapter.readJson(paths.cloudPath)
    if (cloudData !== null) {
      await this.storageAdapter.writeJson(paths.cloudBackupPath, cloudData)
    }
  }

  private async prepareIsolated(paths: ReturnType<typeof resolveStoragePaths>): Promise<void> {
    const isolatedData = await this.storageAdapter.readJson(paths.isolatedPath)
    if (isolatedData === null) {
      const cloudData = await this.storageAdapter.readJson(paths.cloudPath)
      if (cloudData !== null) {
        await this.storageAdapter.writeJson(paths.isolatedPath, cloudData)
      }
    } else {
      await this.storageAdapter.writeJson(paths.cloudPath, isolatedData)
    }
  }

  async preparePluginStorage(
    pluginId: string,
    syncMode: SyncMode,
    platform: PlatformType
  ): Promise<void> {
    if (syncMode === 'bidirectional') {
      return
    }

    const paths = resolveStoragePaths(pluginId, syncMode, platform)

    switch (syncMode) {
      case 'from-cloud':
        await this.prepareFromCloud(paths)
        break
      case 'to-cloud':
        await this.prepareToCloud(paths)
        break
      case 'isolated':
        await this.prepareIsolated(paths)
        break
    }
  }

  async persistPluginStorage(
    pluginId: string,
    syncMode: SyncMode,
    platform: PlatformType,
    currentData: Record<string, unknown>
  ): Promise<void> {
    const paths = resolveStoragePaths(pluginId, syncMode, platform)

    if (syncMode === 'isolated') {
      await this.storageAdapter.writeJson(paths.isolatedPath, currentData)
    } else if (syncMode === 'from-cloud') {
      const backupData = await this.storageAdapter.readJson(paths.cloudBackupPath)
      const baseData = backupData ?? (await this.storageAdapter.readJson(paths.cloudPath))
      const diff = extractOverlayDiff(baseData, currentData)
      await this.storageAdapter.writeJson(paths.overlayPath, diff)
    } else if (syncMode === 'to-cloud') {
      await this.storageAdapter.writeJson(paths.cloudPath, currentData)
      await this.storageAdapter.writeJson(paths.cloudBackupPath, currentData)
    }
  }

  teardown(): void {
    if (this.areHooksInstalled) {
      if (this.originalSaveData) {
        Plugin.prototype.saveData = this.originalSaveData
        this.originalSaveData = null
      }
      if (this.originalLoadData) {
        Plugin.prototype.loadData = this.originalLoadData
        this.originalLoadData = null
      }
      this.areHooksInstalled = false
    }
  }
}
