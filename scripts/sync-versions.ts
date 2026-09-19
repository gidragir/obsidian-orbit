import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import * as path from 'node:path'
import * as process from 'node:process'

interface ManifestJson {
  version: string
  minAppVersion: string
  [key: string]: unknown
}

interface PackageJson {
  version: string
  [key: string]: unknown
}

function getPluginDirectories(pluginsRoot: string): string[] {
  if (!existsSync(pluginsRoot)) {
    return []
  }

  return readdirSync(pluginsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(pluginsRoot, entry.name))
}

function syncPluginVersion(pluginDir: string): void {
  const packagePath = path.join(pluginDir, 'package.json')
  const manifestPath = path.join(pluginDir, 'manifest.json')
  const versionsPath = path.join(pluginDir, 'versions.json')

  if (!existsSync(packagePath) || !existsSync(manifestPath)) {
    return
  }

  const pkg = JSON.parse(readFileSync(packagePath, 'utf-8')) as PackageJson
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as ManifestJson
  const targetVersion = pkg.version

  manifest.version = targetVersion
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8')

  let versionsRecord: Record<string, string> = {}
  if (existsSync(versionsPath)) {
    try {
      versionsRecord = JSON.parse(readFileSync(versionsPath, 'utf-8')) as Record<string, string>
    } catch {
      versionsRecord = {}
    }
  }

  versionsRecord[targetVersion] = manifest.minAppVersion
  writeFileSync(versionsPath, `${JSON.stringify(versionsRecord, null, 2)}\n`, 'utf-8')

  console.log(`[sync-versions] Synced ${path.basename(pluginDir)} to version ${targetVersion}`)
}

function main(): void {
  const repoRoot = process.cwd()
  const pluginsRoot = path.join(repoRoot, 'plugins')
  const pluginDirs = getPluginDirectories(pluginsRoot)

  for (const dir of pluginDirs) {
    syncPluginVersion(dir)
  }
}

main()
