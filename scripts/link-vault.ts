import { existsSync, mkdirSync, readdirSync, rmSync, symlinkSync } from 'node:fs'
import * as path from 'node:path'
import * as process from 'node:process'

function resolveTargetVaultPath(repoRoot: string): string {
  if (process.env.OBSIDIAN_TEST_VAULT_PATH) {
    return path.resolve(process.env.OBSIDIAN_TEST_VAULT_PATH)
  }
  return path.join(repoRoot, '.vault', '.obsidian', 'plugins')
}

function linkPlugin(pluginPath: string, targetPluginsDir: string): void {
  const manifestPath = path.join(pluginPath, 'manifest.json')
  if (!existsSync(manifestPath)) {
    return
  }

  const pluginName = path.basename(pluginPath)
  const linkTarget = path.join(targetPluginsDir, pluginName)

  rmSync(linkTarget, { recursive: true, force: true })

  const isWindows = process.platform === 'win32'
  const symlinkType = isWindows ? 'junction' : 'dir'

  symlinkSync(pluginPath, linkTarget, symlinkType)
  console.log(`[link-vault] Linked plugin ${pluginName} -> ${linkTarget}`)
}

function linkDevVault(repoRoot: string): void {
  const vaultDir = path.join(repoRoot, '.vault')
  if (!existsSync(vaultDir)) {
    mkdirSync(vaultDir, { recursive: true })
  }

  const devVaultLink = path.join(repoRoot, 'dev-vault')
  rmSync(devVaultLink, { recursive: true, force: true })

  const isWindows = process.platform === 'win32'
  const symlinkType = isWindows ? 'junction' : 'dir'

  try {
    symlinkSync('.vault', devVaultLink, symlinkType)
    console.log('[link-vault] Created convenience symlink dev-vault -> .vault')
  } catch (error) {
    console.warn('[link-vault] Could not create dev-vault symlink:', error)
  }
}

function main(): void {
  const repoRoot = process.cwd()
  const targetVaultDir = resolveTargetVaultPath(repoRoot)
  const pluginsRoot = path.join(repoRoot, 'plugins')

  mkdirSync(targetVaultDir, { recursive: true })
  linkDevVault(repoRoot)

  if (!existsSync(pluginsRoot)) {
    console.log('[link-vault] No plugins directory found, skipping plugin linking.')
    return
  }

  const pluginEntries = readdirSync(pluginsRoot, { withFileTypes: true })
  for (const entry of pluginEntries) {
    if (entry.isDirectory()) {
      linkPlugin(path.join(pluginsRoot, entry.name), targetVaultDir)
    }
  }

  console.log(`[link-vault] Vault link complete. Target: ${targetVaultDir}`)
}

main()
