import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, type FileLayoutState, type TilingSettings } from './settings'

describe('FileLayoutState', () => {
  it('supports collapsedLeafIds property in layout state', () => {
    const layout: FileLayoutState = {
      masterRatio: 0.5,
      collapsedLeafIds: ['leaf-1', 'leaf-2'],
    }

    expect(layout.collapsedLeafIds).toEqual(['leaf-1', 'leaf-2'])
  })

  it('persists and retrieves file layout with collapsed leaves in TilingSettings', () => {
    const settings: TilingSettings = {
      ...DEFAULT_SETTINGS,
      fileLayouts: {
        'notes/test.md': {
          collapsedLeafIds: ['leaf-3'],
        },
      },
    }

    const saved = settings.fileLayouts['notes/test.md']
    expect(saved?.collapsedLeafIds).toEqual(['leaf-3'])
  })
})
