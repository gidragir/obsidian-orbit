import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import * as path from 'node:path'
import * as process from 'node:process'

function collectFileStats(dir: string): Record<string, number> {
  const stats: Record<string, number> = {}

  function walk(currentDir: string): void {
    const entries = readdirSync(currentDir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.git') {
          walk(fullPath)
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name) || '(no extension)'
        stats[ext] = (stats[ext] ?? 0) + 1
      }
    }
  }

  walk(dir)
  return stats
}

function printStats(projectName: string, stats: Record<string, number>): void {
  console.log(`[ai:context] File extension statistics for "${projectName}":`)
  const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1])
  for (const [ext, count] of sorted) {
    console.log(`  ${ext}: ${count}`)
  }
}

function runRepomix(targetDir: string, outputFile: string, configFile: string): void {
  const repomixBin = path.resolve('node_modules', '.bin', 'repomix')
  const command = `"${repomixBin}" "${targetDir}" --output "${outputFile}" --config "${configFile}"`

  console.log(`[ai:context] Packaging context to ${outputFile}...`)
  execSync(command, { stdio: 'inherit' })
}

function processReferenceProject(
  referenceRoot: string,
  projectName: string,
  configFile: string
): boolean {
  const targetDir = path.join(referenceRoot, projectName)
  if (!existsSync(targetDir) || !statSync(targetDir).isDirectory()) {
    console.error(`[ai:context] Error: Reference directory not found: ${targetDir}`)
    return false
  }

  const stats = collectFileStats(targetDir)
  printStats(projectName, stats)

  const outputFile = path.join(referenceRoot, `${projectName}-context.md`)

  try {
    runRepomix(targetDir, outputFile, configFile)
    console.log(`[ai:context] Successfully generated AI context: ${outputFile}`)
    return true
  } catch (error) {
    console.error(`[ai:context] Failed to generate AI context for ${projectName}:`, error)
    return false
  }
}

function getReferenceProjects(referenceRoot: string): string[] {
  if (!existsSync(referenceRoot)) {
    mkdirSync(referenceRoot, { recursive: true })
    return []
  }

  return readdirSync(referenceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
}

function main(): void {
  const repoRoot = process.cwd()
  const referenceRoot = path.join(repoRoot, 'reference')
  const configFile = path.join(repoRoot, 'repomix.config.json')

  const args = process.argv.slice(2)
  const targetArg = args[0]
  const isAll = !targetArg || targetArg === '--all'

  if (isAll) {
    const projects = getReferenceProjects(referenceRoot)
    if (projects.length === 0) {
      console.log(
        '[ai:context] No projects found in reference/ directory. Place reference plugins in reference/<plugin-name>/'
      )
      return
    }

    console.log(
      `[ai:context] Found ${projects.length} project(s) in reference/: ${projects.join(', ')}`
    )
    for (const project of projects) {
      processReferenceProject(referenceRoot, project, configFile)
    }
    return
  }

  const cleanTargetName = path.basename(targetArg)
  const success = processReferenceProject(referenceRoot, cleanTargetName, configFile)
  if (!success) {
    process.exit(1)
  }
}

main()
