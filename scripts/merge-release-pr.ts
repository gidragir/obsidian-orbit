import { execSync } from 'node:child_process'
import * as process from 'node:process'

interface PullRequestInfo {
  number: number
}

function runCommand(command: string): string {
  return execSync(command, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
}

function verifyGhCli(): void {
  try {
    runCommand('gh --version')
  } catch {
    console.error('[merge-release-pr] Error: GitHub CLI (gh) is not installed.')
    process.exit(1)
  }

  try {
    runCommand('gh auth status')
  } catch {
    console.error('[merge-release-pr] Error: gh is not authenticated. Run "gh auth login".')
    process.exit(1)
  }
}

function findReleasePrNumber(): number | null {
  try {
    const output = runCommand('gh pr list --state open --head changeset-release/main --json number')
    const prs = JSON.parse(output) as PullRequestInfo[]
    const firstPr = prs[0]
    return firstPr ? firstPr.number : null
  } catch (error) {
    console.error('[merge-release-pr] Failed to list PRs:', error)
    process.exit(1)
  }
}

function syncLocalGit(): void {
  try {
    const status = runCommand('git status --porcelain')
    if (status.length > 0) {
      console.warn('[merge-release-pr] Working directory has uncommitted changes. Skipping pull.')
      return
    }

    console.log('[merge-release-pr] Checking out main and pulling latest changes...')
    runCommand('git checkout main')
    runCommand('git pull origin main')
    console.log('[merge-release-pr] Successfully updated local main branch.')
  } catch (error) {
    console.warn('[merge-release-pr] Warning: Failed to sync local git branch:', error)
  }
}

function main(): void {
  verifyGhCli()

  const prNumber = findReleasePrNumber()
  if (prNumber === null) {
    console.log('[merge-release-pr] Релиз не требуется (No open release PR found).')
    process.exit(0)
  }

  console.log(`[merge-release-pr] Merging release PR #${prNumber}...`)
  try {
    runCommand(`gh pr merge ${prNumber} --merge --auto`)
    console.log(`[merge-release-pr] PR #${prNumber} merged successfully.`)
  } catch (error) {
    console.error(`[merge-release-pr] Failed to merge PR #${prNumber}:`, error)
    process.exit(1)
  }

  syncLocalGit()
}

main()
