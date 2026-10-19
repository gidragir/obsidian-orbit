import { describe, expect, it } from 'vitest'
import {
  calculateDiff,
  deepMerge,
  extractOverlayDiff,
  prepareEffectiveData,
  resolveStoragePaths,
} from './shadow-storage'

describe('shadow-storage', () => {
  it('resolves correct paths for different sync modes', () => {
    const biPaths = resolveStoragePaths('my-plugin', 'bidirectional', 'desktop')
    expect(biPaths.effectiveReadPath).toBe('.obsidian/plugins/my-plugin/data.json')
    expect(biPaths.effectiveWritePath).toBe('.obsidian/plugins/my-plugin/data.json')

    const fromCloudPaths = resolveStoragePaths('my-plugin', 'from-cloud', 'mobile')
    expect(fromCloudPaths.effectiveReadPath).toBe('.obsidian/plugins/my-plugin/data.json')
    expect(fromCloudPaths.effectiveWritePath).toBe('.obsidian/plugins/my-plugin/data.local.json')

    const isolatedPaths = resolveStoragePaths('my-plugin', 'isolated', 'desktop')
    expect(isolatedPaths.effectiveReadPath).toBe('.obsidian/plugins/my-plugin/data.desktop.json')
    expect(isolatedPaths.effectiveWritePath).toBe('.obsidian/plugins/my-plugin/data.desktop.json')
  })

  it('deeply merges nested objects without mutating base', () => {
    const base = {
      theme: 'dark',
      editor: {
        fontSize: 14,
        lineNumbers: true,
      },
      tags: ['a', 'b'],
    }

    const override = {
      editor: {
        fontSize: 18,
      },
    }

    const merged = deepMerge(base, override)
    expect(merged).toEqual({
      theme: 'dark',
      editor: {
        fontSize: 18,
        lineNumbers: true,
      },
      tags: ['a', 'b'],
    })
    expect(base.editor.fontSize).toBe(14)
  })

  it('calculates diff accurately between base and current state', () => {
    const base = {
      theme: 'dark',
      editor: {
        fontSize: 14,
        lineNumbers: true,
      },
    }

    const current = {
      theme: 'dark',
      editor: {
        fontSize: 16,
        lineNumbers: true,
      },
      newSetting: true,
    }

    const diff = calculateDiff(base, current)
    expect(diff).toEqual({
      editor: {
        fontSize: 16,
      },
      newSetting: true,
    })
  })

  it('prepares effective data correctly per sync mode', () => {
    const cloud = { font: 12, mode: 'vim' }
    const local = { font: 16 }

    expect(prepareEffectiveData('bidirectional', cloud, local)).toEqual(cloud)
    expect(prepareEffectiveData('to-cloud', cloud, local)).toEqual(cloud)
    expect(prepareEffectiveData('from-cloud', cloud, local)).toEqual({
      font: 16,
      mode: 'vim',
    })
    expect(prepareEffectiveData('isolated', cloud, local)).toEqual(local)
    expect(prepareEffectiveData('isolated', cloud, null)).toEqual(cloud)
    // If local file is an empty object (user cleared all settings locally), return empty object
    expect(prepareEffectiveData('isolated', cloud, {})).toEqual({})
  })

  it('extracts overlay diff properly with null and populated base', () => {
    const current = { theme: 'custom', font: 16 }
    expect(extractOverlayDiff(null, current)).toEqual(current)

    const base = { theme: 'default', font: 16, autoSave: true }
    expect(extractOverlayDiff(base, { theme: 'custom', font: 16, autoSave: true })).toEqual({
      theme: 'custom',
    })
  })

  it('resolves backup paths for to-cloud and from-cloud', () => {
    const paths = resolveStoragePaths('test-plugin', 'to-cloud', 'desktop')
    expect(paths.cloudBackupPath).toBe('.obsidian/plugins/test-plugin/data.cloud.json')
    expect(paths.cloudPath).toBe('.obsidian/plugins/test-plugin/data.json')
  })
})
