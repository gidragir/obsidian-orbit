import type { TileNode } from '@packages/core'

export interface FileLayoutState {
  readonly tree?: TileNode
  readonly masterRatio?: number
  readonly stackWeights?: ReadonlyArray<number>
}

export interface TilingSettings {
  readonly masterRatio: number
  readonly frontmatterKey: string
  readonly debounceMs: number
  readonly panelGap: number
  readonly syncTextOrder: boolean
  readonly fileLayouts: Record<string, FileLayoutState>
}

export const DEFAULT_SETTINGS: TilingSettings = {
  masterRatio: 0.6,
  frontmatterKey: 'orbit-tiling',
  debounceMs: 500,
  panelGap: 10,
  syncTextOrder: true,
  fileLayouts: {},
}
