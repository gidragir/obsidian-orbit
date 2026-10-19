import type { PlatformType } from '@core/types'
import { Platform } from 'obsidian'

export class ObsidianPlatformAdapter {
  getCurrentPlatform(): PlatformType {
    return Platform.isDesktop ? 'desktop' : 'mobile'
  }

  isDesktop(): boolean {
    return Platform.isDesktop
  }

  isMobile(): boolean {
    return Platform.isMobile
  }
}
