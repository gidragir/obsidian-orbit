import { isPluginActiveOnPlatform, isPluginAllowedOnPlatform } from '@core/platform-matrix'
import { formatDurationMs, type SlowPluginEntry, type TelemetrySummary } from '@core/telemetry'
import type {
  BootstrapSyncStatus,
  InstalledPluginInfo,
  PlatformType,
  PluginPlatformFilter,
  PluginProfileConfig,
  StartupPhase,
  SyncMode,
  TelemetryBootRecord,
  VaultRendererSettings,
} from '@core/types'
import { createSetting } from '@packages/ui'
import {
  type App,
  DropdownComponent,
  type Plugin,
  PluginSettingTab,
  TextComponent,
  ToggleComponent,
} from 'obsidian'

export interface VaultRendererHost {
  getSettings(): VaultRendererSettings
  updateSettings(partial: Partial<VaultRendererSettings>): Promise<void>
  getInstalledPlugins(): Record<string, InstalledPluginInfo>
  getCurrentPlatform(): PlatformType
  getTelemetrySummary(): TelemetrySummary
  getLatestTelemetry(): TelemetryBootRecord | null
  getSlowestPlugins(limit?: number): readonly SlowPluginEntry[]
  isPluginCurrentlyEnabled(id: string): boolean
  togglePlugin(id: string, enabled: boolean): Promise<void>
  clearTelemetryHistory(): Promise<void>
  syncBootstrapPlugins(): Promise<void>
  restoreNativeCommunityPlugins(): Promise<void>
  getBootstrapSyncStatus(): Promise<BootstrapSyncStatus>
}

type DisplayFilterMode = 'active' | 'all' | 'disabled'

export class VaultRendererSettingTab extends PluginSettingTab {
  private readonly host: VaultRendererHost
  private searchQuery = ''
  private displayFilter: DisplayFilterMode = 'active'
  private listContainerEl: HTMLElement | null = null
  private filterTabsContainerEl: HTMLElement | null = null

  constructor(app: App, plugin: Plugin, host: VaultRendererHost) {
    super(app, plugin)
    this.host = host
  }

  display(): void {
    const { containerEl } = this
    containerEl.empty()
    containerEl.addClass('vault-renderer-settings')

    this.renderHeader(containerEl)
    this.renderTelemetrySummary(containerEl)
    this.renderBootstrapSection(containerEl)
    this.renderGlobalSettings(containerEl)
    this.renderPluginMatrix(containerEl)
  }

  private renderHeader(containerEl: HTMLElement): void {
    const header = containerEl.createDiv({ cls: 'vault-renderer-header' })
    const titleGroup = header.createDiv({ cls: 'header-title-group' })
    titleGroup.createEl('h2', { text: 'Vault Renderer' })
    titleGroup.createEl('div', {
      cls: 'header-subtitle',
      text: 'Multi-phase startup scheduler & cross-platform engine',
    })

    const platform = this.host.getCurrentPlatform()
    const badge = header.createDiv({
      cls: `vault-renderer-platform-badge orbit-badge orbit-badge--pill orbit-badge--outline ${platform}`,
    })
    badge.createSpan({ cls: 'platform-dot orbit-status-dot' })
    badge.createSpan({ cls: 'platform-text', text: platform.toUpperCase() })
    badge.title = `Current device environment: ${platform}`
  }

  private renderTelemetrySummary(containerEl: HTMLElement): void {
    const section = containerEl.createDiv({
      cls: 'vault-renderer-telemetry-panel orbit-card',
    })
    const headRow = section.createDiv({ cls: 'panel-header' })
    headRow.createEl('h3', { text: 'Cold-Start Telemetry' })

    const summary = this.host.getTelemetrySummary()
    const latest = this.host.getLatestTelemetry()

    if (summary.bootCount > 0) {
      const resetBtn = headRow.createEl('button', {
        cls: 'mod-muted telemetry-reset-btn',
        text: 'Reset data',
      })
      resetBtn.title = 'Clear collected startup telemetry history'
      resetBtn.addEventListener('click', async () => {
        await this.host.clearTelemetryHistory()
        this.display()
      })
    }

    const statsGrid = section.createDiv({
      cls: 'vault-renderer-stats-grid orbit-stats-grid',
    })

    const createStatCard = (label: string, value: string, subtitle?: string) => {
      const card = statsGrid.createDiv({
        cls: 'vault-renderer-stat-card orbit-stat-card',
      })
      card.createSpan({ cls: 'stat-label', text: label })
      card.createSpan({ cls: 'stat-value', text: value })
      if (subtitle) {
        card.createSpan({ cls: 'stat-subtitle', text: subtitle })
      }
    }

    const interactiveTime = latest ? formatDurationMs(latest.coldStartDurationMs) : 'N/A'
    const avgColdStart = formatDurationMs(summary.avgColdStartMs)
    const pausesFormatted = latest
      ? `${latest.interactionPausesCount} (${formatDurationMs(latest.totalInteractionPauseMs)})`
      : '0 (0 ms)'

    createStatCard('Interactive (TTI)', interactiveTime)
    createStatCard('Avg Cold Start', avgColdStart)
    createStatCard('Recorded Boots', String(summary.bootCount))
    createStatCard('Interaction Pauses', pausesFormatted)

    this.renderSlowestPlugins(section, latest)
  }

  private renderSlowestPlugins(section: HTMLElement, latest: TelemetryBootRecord | null): void {
    if (!latest) {
      return
    }

    const slowest = this.host.getSlowestPlugins(4)
    if (slowest.length === 0) {
      return
    }

    const slowContainer = section.createDiv({ cls: 'vault-renderer-slowest-list' })
    slowContainer.createEl('span', {
      cls: 'slowest-list-title',
      text: 'Slowest plugins last boot:',
    })

    const pillsRow = slowContainer.createDiv({ cls: 'slowest-pills-row' })
    for (const item of slowest) {
      const pill = pillsRow.createSpan({
        cls: 'slowest-plugin-pill orbit-badge orbit-badge--outline',
      })
      pill.createSpan({ cls: 'plugin-name', text: item.id })
      pill.createSpan({ cls: 'plugin-duration', text: formatDurationMs(item.durationMs) })
      pill.createSpan({
        cls: `phase-tag phase-${item.phase}`,
        text: item.phase,
      })
    }
  }

  private renderBootstrapSection(containerEl: HTMLElement): void {
    const section = containerEl.createDiv({
      cls: 'vault-renderer-bootstrap-panel orbit-card',
    })
    const headRow = section.createDiv({ cls: 'panel-header' })
    headRow.createEl('h3', { text: 'Native Bootstrap & Disaster Recovery' })

    section.createEl('p', {
      cls: 'setting-item-description',
      text:
        'Maintains a minimal community-plugins.json on disk (instant/interactive phases only) ' +
        'to prevent synchronous cold-start blocking, with full backup in community-plugins.vault-renderer.bak.',
    })

    const statusRow = section.createDiv({ cls: 'bootstrap-status-row' })
    const badge = statusRow.createSpan({
      cls: 'orbit-badge orbit-badge--pill orbit-badge--outline',
      text: 'Checking status...',
    })

    const actionsRow = section.createDiv({ cls: 'bootstrap-actions-row' })
    const syncBtn = actionsRow.createEl('button', {
      cls: 'mod-cta',
      text: 'Sync bootstrap now',
    })
    syncBtn.addEventListener('click', async () => {
      syncBtn.disabled = true
      await this.host.syncBootstrapPlugins()
      syncBtn.disabled = false
      this.display()
    })

    const restoreBtn = actionsRow.createEl('button', {
      cls: 'mod-warning',
      text: 'Restore full plugins (Emergency / Uninstall)',
    })
    restoreBtn.title = 'Restores all enabled plugins into native Obsidian community-plugins.json'
    restoreBtn.addEventListener('click', async () => {
      restoreBtn.disabled = true
      await this.host.restoreNativeCommunityPlugins()
      restoreBtn.disabled = false
      this.display()
    })

    void this.host.getBootstrapSyncStatus().then((status) => {
      badge.setText(
        `Bootstrap: ${status.bootstrapCount} early / ${status.deferredCount} deferred (${status.totalActiveCount} total active)`
      )
    })
  }

  private renderGlobalSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h3', { text: 'Core Orchestration' })
    const settings = this.host.getSettings()

    createSetting(containerEl, {
      name: 'Enable Native Bootstrap Optimization',
      desc: 'Maintains only early plugins on disk to bypass Obsidian synchronous loading trap.',
    }).addToggle((toggle) =>
      toggle.setValue(settings.enableBootstrapSync).onChange(async (val) => {
        await this.host.updateSettings({ enableBootstrapSync: val })
        if (val) {
          await this.host.syncBootstrapPlugins()
        } else {
          await this.host.restoreNativeCommunityPlugins()
        }
      })
    )

    createSetting(containerEl, {
      name: 'Enable Multi-phase Startup Scheduler',
      desc: 'Staggers plugin loading across Instant, Interactive, Deferred, and Idle phases.',
    }).addToggle((toggle) =>
      toggle.setValue(settings.enableScheduler).onChange(async (val) => {
        await this.host.updateSettings({ enableScheduler: val })
      })
    )

    createSetting(containerEl, {
      name: 'Enable Platform-Aware Plugin Filter',
      desc: 'Automatically controls which plugins run on desktop vs mobile.',
    }).addToggle((toggle) =>
      toggle.setValue(settings.enablePlatformFilter).onChange(async (val) => {
        await this.host.updateSettings({ enablePlatformFilter: val })
      })
    )

    createSetting(containerEl, {
      name: 'Enable Shadow Storage Engine',
      desc: 'Provides directional settings sync and local overrides (to-cloud, from-cloud, isolated).',
    }).addToggle((toggle) =>
      toggle.setValue(settings.enableShadowStorage).onChange(async (val) => {
        await this.host.updateSettings({ enableShadowStorage: val })
      })
    )

    createSetting(containerEl, {
      name: 'Interaction Guard Timeout (ms)',
      desc: 'Debounce window for pausing background plugin loads when user types or interacts.',
    }).addText((text) =>
      text.setValue(String(settings.interactionGuardTimeoutMs)).onChange(async (val) => {
        const parsed = Number.parseInt(val, 10)
        if (!Number.isNaN(parsed) && parsed >= 0) {
          await this.host.updateSettings({ interactionGuardTimeoutMs: parsed })
        }
      })
    )

    createSetting(containerEl, {
      name: 'Deferred Phase Delay (ms)',
      desc: 'Delay before background plugins in Deferred phase start loading.',
    }).addText((text) =>
      text.setValue(String(settings.deferredPhaseDelayMs)).onChange(async (val) => {
        const parsed = Number.parseInt(val, 10)
        if (!Number.isNaN(parsed) && parsed >= 0) {
          await this.host.updateSettings({ deferredPhaseDelayMs: parsed })
        }
      })
    )
  }

  private renderPluginMatrix(containerEl: HTMLElement): void {
    containerEl.createEl('h3', { text: 'Plugin Lifecycle & Sync Matrix' })

    const toolbarEl = containerEl.createDiv({ cls: 'vault-renderer-toolbar' })
    this.renderToolbar(toolbarEl)

    this.listContainerEl = containerEl.createDiv({
      cls: 'vault-renderer-plugin-list',
    })
    this.populatePluginRows(this.listContainerEl)
  }

  private renderToolbar(toolbarEl: HTMLElement): void {
    const searchWrapper = toolbarEl.createDiv({ cls: 'vault-renderer-search-box' })
    const searchInput = new TextComponent(searchWrapper)
    searchInput.setPlaceholder('Filter by plugin name or ID...').onChange((val) => {
      this.searchQuery = val.trim().toLowerCase()
      this.refreshPluginList()
    })

    this.filterTabsContainerEl = toolbarEl.createDiv({
      cls: 'vault-renderer-filter-tabs orbit-filter-tabs',
    })
    this.refreshFilterTabs()
  }

  private refreshFilterTabs(): void {
    if (!this.filterTabsContainerEl) {
      return
    }
    this.filterTabsContainerEl.empty()

    const { activeCount, disabledCount, totalCount } = this.getPluginCounts()
    const tabs: Array<{ mode: DisplayFilterMode; label: string; count: number }> = [
      { mode: 'active', label: 'Active', count: activeCount },
      { mode: 'all', label: 'All', count: totalCount },
      { mode: 'disabled', label: 'Disabled', count: disabledCount },
    ]

    for (const tab of tabs) {
      const btn = this.filterTabsContainerEl.createEl('button', {
        cls: `filter-tab orbit-filter-tab ${this.displayFilter === tab.mode ? 'is-active' : ''}`,
      })
      btn.createSpan({ cls: 'tab-label', text: tab.label })
      btn.createSpan({ cls: 'tab-badge orbit-badge', text: String(tab.count) })
      btn.addEventListener('click', () => {
        this.displayFilter = tab.mode
        this.refreshFilterTabs()
        this.refreshPluginList()
      })
    }
  }

  private getEffectivePluginConfig(
    id: string,
    settings: VaultRendererSettings
  ): PluginProfileConfig {
    const existing = settings.plugins[id]
    if (existing) {
      return existing
    }
    const isCurrentlyEnabled = this.host.isPluginCurrentlyEnabled(id)
    return {
      id,
      enabled: isCurrentlyEnabled,
      filter: isCurrentlyEnabled ? 'all' : 'disabled',
      phase: 'interactive',
      delayMs: 0,
      dependencies: [],
      syncMode: 'bidirectional',
    }
  }

  private getPluginCounts(): { activeCount: number; disabledCount: number; totalCount: number } {
    const settings = this.host.getSettings()
    const installed = this.host.getInstalledPlugins()
    const platform = this.host.getCurrentPlatform()
    let activeCount = 0
    let disabledCount = 0

    for (const id of Object.keys(installed)) {
      if (id === 'vault-renderer') {
        continue
      }
      const config = this.getEffectivePluginConfig(id, settings)
      if (isPluginActiveOnPlatform(config, platform)) {
        activeCount++
      } else {
        disabledCount++
      }
    }

    return {
      activeCount,
      disabledCount,
      totalCount: activeCount + disabledCount,
    }
  }

  private refreshAllPluginViews(): void {
    this.refreshFilterTabs()
    this.refreshPluginList()
  }

  private refreshPluginList(): void {
    if (this.listContainerEl) {
      this.listContainerEl.empty()
      this.populatePluginRows(this.listContainerEl)
    }
  }

  private populatePluginRows(containerEl: HTMLElement): void {
    const settings = this.host.getSettings()
    const installed = this.host.getInstalledPlugins()
    const platform = this.host.getCurrentPlatform()
    const query = this.searchQuery

    const entries = Object.entries(installed).filter(([id]) => id !== 'vault-renderer')
    entries.sort((a, b) => a[1].name.localeCompare(b[1].name))

    let renderedCount = 0
    for (const [id, info] of entries) {
      if (query && !id.toLowerCase().includes(query) && !info.name.toLowerCase().includes(query)) {
        continue
      }

      const config = this.getEffectivePluginConfig(id, settings)
      const isActive = isPluginActiveOnPlatform(config, platform)

      if (this.displayFilter === 'active' && !isActive) {
        continue
      }
      if (this.displayFilter === 'disabled' && isActive) {
        continue
      }

      this.renderPluginCard(containerEl, info, config, isActive)
      renderedCount++
    }

    if (renderedCount === 0) {
      const emptyState = containerEl.createDiv({
        cls: 'vault-renderer-empty-state orbit-empty-state',
      })
      emptyState.createEl('p', {
        text: query
          ? `No plugins matching "${query}".`
          : `No ${this.displayFilter} plugins found on this platform.`,
      })
    }
  }

  private renderPluginCard(
    containerEl: HTMLElement,
    info: InstalledPluginInfo,
    config: PluginProfileConfig,
    isActive: boolean
  ): void {
    const card = containerEl.createDiv({
      cls: `vault-renderer-plugin-card orbit-card ${isActive ? 'is-active' : 'is-inactive'}`,
    })

    this.renderCardHeader(card, info, config, isActive)
    this.renderCardControls(card, config)
  }

  private renderCardHeader(
    card: HTMLElement,
    info: InstalledPluginInfo,
    config: PluginProfileConfig,
    isActive: boolean
  ): void {
    const header = card.createDiv({ cls: 'plugin-card-header' })

    const infoContainer = header.createDiv({ cls: 'plugin-card-info' })
    const titleRow = infoContainer.createDiv({ cls: 'plugin-card-title-row' })
    titleRow.createSpan({ cls: 'plugin-card-name', text: info.name })

    const metaRow = infoContainer.createDiv({ cls: 'plugin-card-meta' })
    metaRow.createEl('code', { cls: 'plugin-meta-id orbit-badge--code', text: info.id })
    metaRow.createSpan({ cls: 'plugin-meta-version', text: `v${info.version}` })

    if (config.dependencies.length > 0) {
      metaRow.createSpan({
        cls: 'plugin-meta-deps',
        text: `Deps: [${config.dependencies.join(', ')}]`,
      })
    }

    const toggleWrapper = header.createDiv({ cls: 'plugin-card-toggle' })
    const toggle = new ToggleComponent(toggleWrapper)
    toggle
      .setTooltip(isActive ? 'Disable plugin' : 'Enable plugin')
      .setValue(isActive)
      .onChange(async (val) => {
        const platform = this.host.getCurrentPlatform()
        if (val) {
          const nextFilter = config.filter === 'disabled' ? 'all' : config.filter
          const shouldRunOnPlatform = isPluginAllowedOnPlatform(nextFilter, platform)
          if (shouldRunOnPlatform) {
            await this.host.togglePlugin(config.id, true)
          }
          await this.updatePluginConfig(config.id, {
            enabled: true,
            filter: nextFilter,
          })
        } else {
          await this.host.togglePlugin(config.id, false)
          await this.updatePluginConfig(config.id, {
            enabled: false,
          })
        }
        this.refreshAllPluginViews()
      })
  }

  private renderCardControls(card: HTMLElement, config: PluginProfileConfig): void {
    const controls = card.createDiv({ cls: 'plugin-card-controls' })

    this.createPlatformControl(controls, config)
    this.createPhaseControl(controls, config)
    this.createSyncControl(controls, config)
    this.createDelayControl(controls, config)
  }

  private createPlatformControl(container: HTMLElement, config: PluginProfileConfig): void {
    const item = container.createDiv({ cls: 'plugin-control-item' })
    item.createEl('label', { cls: 'control-label orbit-control-label', text: 'Platform' })
    const dropdown = new DropdownComponent(item)
    dropdown
      .addOption('all', 'All Platforms')
      .addOption('desktop-only', 'Desktop Only')
      .addOption('mobile-only', 'Mobile Only')
      .addOption('disabled', 'Disabled')
      .setValue(config.filter)
      .onChange(async (val) => {
        const newFilter = val as PluginPlatformFilter
        const enabled = newFilter !== 'disabled'
        const platform = this.host.getCurrentPlatform()
        const shouldRun = enabled && isPluginAllowedOnPlatform(newFilter, platform)
        if (shouldRun) {
          await this.host.togglePlugin(config.id, true)
        } else {
          await this.host.togglePlugin(config.id, false)
        }
        await this.updatePluginConfig(config.id, {
          filter: newFilter,
          enabled,
        })
        this.refreshAllPluginViews()
      })
  }

  private createPhaseControl(container: HTMLElement, config: PluginProfileConfig): void {
    const item = container.createDiv({ cls: 'plugin-control-item' })
    item.createEl('label', { cls: 'control-label orbit-control-label', text: 'Phase' })
    const dropdown = new DropdownComponent(item)
    dropdown
      .addOption('instant', 'Instant')
      .addOption('interactive', 'Interactive')
      .addOption('deferred', 'Deferred')
      .addOption('idle', 'Idle')
      .setValue(config.phase)
      .onChange(async (val) => {
        await this.updatePluginConfig(config.id, {
          phase: val as StartupPhase,
        })
      })
  }

  private createSyncControl(container: HTMLElement, config: PluginProfileConfig): void {
    const item = container.createDiv({ cls: 'plugin-control-item' })
    item.createEl('label', { cls: 'control-label orbit-control-label', text: 'Sync Mode' })
    const dropdown = new DropdownComponent(item)
    dropdown
      .addOption('bidirectional', 'Bi-directional')
      .addOption('to-cloud', 'To-Cloud (Master)')
      .addOption('from-cloud', 'From-Cloud (Replica)')
      .addOption('isolated', 'Isolated')
      .setValue(config.syncMode)
      .onChange(async (val) => {
        await this.updatePluginConfig(config.id, {
          syncMode: val as SyncMode,
        })
      })
  }

  private createDelayControl(container: HTMLElement, config: PluginProfileConfig): void {
    const item = container.createDiv({ cls: 'plugin-control-item delay-item' })
    item.createEl('label', { cls: 'control-label orbit-control-label', text: 'Delay' })
    const inputGroup = item.createDiv({ cls: 'delay-input-group' })
    const textInput = new TextComponent(inputGroup)
    textInput
      .setPlaceholder('0')
      .setValue(config.delayMs > 0 ? String(config.delayMs) : '')
      .onChange(async (val) => {
        const parsed = Number.parseInt(val, 10)
        const delayMs = !Number.isNaN(parsed) && parsed >= 0 ? parsed : 0
        await this.updatePluginConfig(config.id, { delayMs })
      })
    inputGroup.createSpan({ cls: 'delay-unit', text: 'ms' })
  }

  private async updatePluginConfig(
    pluginId: string,
    partial: Partial<PluginProfileConfig>
  ): Promise<void> {
    const settings = this.host.getSettings()
    const current = this.getEffectivePluginConfig(pluginId, settings)

    const updatedPlugins = {
      ...settings.plugins,
      [pluginId]: { ...current, ...partial },
    }

    await this.host.updateSettings({ plugins: updatedPlugins })
  }
}
