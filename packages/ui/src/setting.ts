import { Setting } from 'obsidian'

export interface SettingOptions {
  readonly name: string
  readonly desc?: string
}

/**
 * Creates an Obsidian Setting element with name and optional description.
 */
export function createSetting(containerEl: HTMLElement, options: SettingOptions): Setting {
  const setting = new Setting(containerEl).setName(options.name)
  if (options.desc) {
    setting.setDesc(options.desc)
  }
  return setting
}
