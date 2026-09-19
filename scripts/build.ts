import { existsSync } from 'node:fs'
import { builtinModules } from 'node:module'
import * as path from 'node:path'
import * as process from 'node:process'
import * as esbuild from 'esbuild'

const EXTERNAL_MODULES: readonly string[] = [
  'obsidian',
  'electron',
  '@codemirror/autocomplete',
  '@codemirror/collab',
  '@codemirror/commands',
  '@codemirror/language',
  '@codemirror/lint',
  '@codemirror/search',
  '@codemirror/state',
  '@codemirror/view',
  '@lezer/common',
  '@lezer/highlight',
  '@lezer/lr',
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
]

function resolvePluginDir(): string {
  const args = process.argv.slice(2)
  const pluginIndex = args.indexOf('--plugin')

  if (pluginIndex !== -1 && pluginIndex + 1 < args.length) {
    const pluginId = args[pluginIndex + 1]
    if (pluginId) {
      return path.resolve(process.cwd(), 'plugins', pluginId)
    }
  }

  return process.cwd()
}

function validatePluginDir(pluginDir: string): void {
  const manifestPath = path.join(pluginDir, 'manifest.json')
  if (!existsSync(manifestPath)) {
    console.error(`[build] Error: manifest.json not found in ${pluginDir}`)
    process.exit(1)
  }
}

function getJsBuildOptions(pluginDir: string, isDev: boolean): esbuild.BuildOptions {
  return {
    entryPoints: [path.join(pluginDir, 'src', 'main.ts')],
    outfile: path.join(pluginDir, 'main.js'),
    bundle: true,
    format: 'cjs',
    platform: 'node',
    target: 'es2022',
    sourcemap: isDev ? 'inline' : false,
    minify: !isDev,
    treeShaking: true,
    external: [...EXTERNAL_MODULES],
    logLevel: 'info',
  }
}

function getCssBuildOptions(pluginDir: string, isDev: boolean): esbuild.BuildOptions | null {
  const cssEntry = path.join(pluginDir, 'src', 'styles.css')
  if (!existsSync(cssEntry)) {
    return null
  }

  return {
    entryPoints: [cssEntry],
    outfile: path.join(pluginDir, 'styles.css'),
    bundle: true,
    minify: !isDev,
    logLevel: 'info',
  }
}

async function runBuild(): Promise<void> {
  const pluginDir = resolvePluginDir()
  validatePluginDir(pluginDir)

  const isDev = process.argv.includes('--watch')
  const jsOptions = getJsBuildOptions(pluginDir, isDev)
  const cssOptions = getCssBuildOptions(pluginDir, isDev)

  if (isDev) {
    const jsCtx = await esbuild.context(jsOptions)
    await jsCtx.watch()

    if (cssOptions) {
      const cssCtx = await esbuild.context(cssOptions)
      await cssCtx.watch()
    }
    console.log(`[build] Watching for changes in ${pluginDir}...`)
  } else {
    await esbuild.build(jsOptions)
    if (cssOptions) {
      await esbuild.build(cssOptions)
    }
    console.log(`[build] Successfully built plugin in ${pluginDir}`)
  }
}

runBuild().catch((error: unknown) => {
  console.error('[build] Build failed:', error)
  process.exit(1)
})
