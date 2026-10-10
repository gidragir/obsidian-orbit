import { execSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import * as process from 'node:process'

interface PluginManifest {
  version: string
  [key: string]: unknown
}

interface PluginPackage {
  repository?: {
    url?: string
  }
  [key: string]: unknown
}

function runCommand(command: string, cwd?: string, env?: Record<string, string>): string {
  return execSync(command, {
    cwd,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, ...env },
  }).trim()
}

function getRepoUrlWithAuth(rawUrl: string, pat?: string): string {
  if (!pat) {
    return rawUrl
  }

  const cleanUrl = rawUrl.replace(/^git\+/, '').replace(/\.git$/, '')
  const httpsPrefix = 'https://'

  if (cleanUrl.startsWith(httpsPrefix)) {
    return `https://${pat}@${cleanUrl.slice(httpsPrefix.length)}.git`
  }

  return rawUrl
}

function satelliteRepoExists(repoUrl: string): boolean {
  try {
    runCommand(`gh repo view ${repoUrl} --json name`)
    return true
  } catch {
    return false
  }
}

function releaseExists(repoUrl: string, version: string): boolean {
  try {
    runCommand(`gh release view ${version} --repo ${repoUrl}`)
    return true
  } catch {
    return false
  }
}

function copyReleaseMetadata(pluginDir: string, repoRoot: string, cloneDir: string): void {
  copyFileSync(path.join(pluginDir, 'manifest.json'), path.join(cloneDir, 'manifest.json'))
  copyFileSync(path.join(pluginDir, 'versions.json'), path.join(cloneDir, 'versions.json'))

  const localLicense = path.join(pluginDir, 'LICENSE')
  const rootLicense = path.join(repoRoot, 'LICENSE')
  const targetLicense = path.join(cloneDir, 'LICENSE')

  if (existsSync(localLicense)) {
    copyFileSync(localLicense, targetLicense)
  } else if (existsSync(rootLicense)) {
    copyFileSync(rootLicense, targetLicense)
  }

  const localReadme = path.join(pluginDir, 'README.md')
  if (existsSync(localReadme)) {
    copyFileSync(localReadme, path.join(cloneDir, 'README.md'))
  }
}

function createGitHubRelease(pluginDir: string, repoUrl: string, version: string): void {
  const mainJs = path.join(pluginDir, 'main.js')
  const manifest = path.join(pluginDir, 'manifest.json')
  const stylesCss = path.join(pluginDir, 'styles.css')

  if (!existsSync(mainJs)) {
    throw new Error(`main.js not found in ${pluginDir}. Run build first.`)
  }

  const assets: string[] = [mainJs, manifest]
  if (existsSync(stylesCss)) {
    assets.push(stylesCss)
  }

  const assetArgs = assets.map((a) => `"${a}"`).join(' ')
  runCommand(
    `gh release create ${version} ${assetArgs} --repo ${repoUrl} --title "${version}" --notes "Release ${version}"`
  )
}

function deployPlugin(pluginDir: string, repoRoot: string, isForce: boolean): void {
  const manifestPath = path.join(pluginDir, 'manifest.json')
  const packagePath = path.join(pluginDir, 'package.json')

  if (!existsSync(manifestPath) || !existsSync(packagePath)) {
    return
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as PluginManifest
  const pkg = JSON.parse(readFileSync(packagePath, 'utf-8')) as PluginPackage
  const repoUrl = pkg.repository?.url

  if (!repoUrl) {
    console.warn(`[deploy] No repository.url found for ${path.basename(pluginDir)}, skipping.`)
    return
  }

  const version = manifest.version
  if (!satelliteRepoExists(repoUrl)) {
    console.warn(
      `[deploy] Satellite repository ${repoUrl} does not exist on GitHub or is inaccessible. Skipping deployment for ${path.basename(pluginDir)}.`
    )
    return
  }

  if (!isForce && releaseExists(repoUrl, version)) {
    console.log(`[deploy] Release ${version} for ${repoUrl} already exists. Skipping.`)
    return
  }

  const pat = process.env.RELEASE_PAT
  const authRepoUrl = getRepoUrlWithAuth(repoUrl, pat)
  const tempDir = mkdtempSync(path.join(os.tmpdir(), 'orbit-downstream-'))

  try {
    console.log(`[deploy] Cloning satellite repo ${repoUrl}...`)
    runCommand(`git clone --depth 1 ${authRepoUrl} .`, tempDir)

    copyReleaseMetadata(pluginDir, repoRoot, tempDir)

    runCommand('git add .', tempDir)
    runCommand('git config user.name "github-actions[bot]"', tempDir)
    runCommand(
      'git config user.email "41898282+github-actions[bot]@users.noreply.github.com"',
      tempDir
    )
    if (pat) {
      const basicAuth = Buffer.from(`x-access-token:${pat}`).toString('base64')
      runCommand(
        `git config http.https://github.com/.extraheader "AUTHORIZATION: basic ${basicAuth}"`,
        tempDir
      )
    }
    runCommand(`git commit -m "chore(release): release ${version}"`, tempDir)
    runCommand('git push origin main', tempDir)

    console.log(`[deploy] Creating GitHub release ${version}...`)
    createGitHubRelease(pluginDir, repoUrl, version)
    console.log(`[deploy] Successfully deployed ${path.basename(pluginDir)} ${version}`)
  } catch (err) {
    console.error(
      `[deploy] Failed to deploy satellite repository ${repoUrl} for ${path.basename(pluginDir)}:`,
      err
    )
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
}

function main(): void {
  const repoRoot = process.cwd()
  const pluginsRoot = path.join(repoRoot, 'plugins')
  const isForce = process.argv.includes('--force')

  if (!existsSync(pluginsRoot)) {
    console.log('[deploy] No plugins found to deploy.')
    return
  }

  const entries = readdirSync(pluginsRoot, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isDirectory()) {
      deployPlugin(path.join(pluginsRoot, entry.name), repoRoot, isForce)
    }
  }
}

main()
