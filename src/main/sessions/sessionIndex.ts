import { app } from 'electron'
import { createReadStream } from 'node:fs'
import { readdir, stat } from 'node:fs/promises'
import { createInterface } from 'node:readline'
import { join } from 'node:path'
import type { SessionSummary } from '../../shared/types'
import { loadPinnedSessionIds } from '../agents/agentStore'

/** How many of the most-recently-modified sessions get their preview text
 * parsed (cheap per-file, but no reason to do it for hundreds of old ones
 * the user will never scroll to). Pinned sessions are always included on
 * top of this window, regardless of age. */
const RECENT_WINDOW = 40
const PREVIEW_LINE_CAP = 60
const PREVIEW_MAX_CHARS = 140

interface FileEntry {
  id: string
  path: string
  mtimeMs: number
}

async function findSessionFiles(): Promise<FileEntry[]> {
  const projectsDir = join(app.getPath('home'), '.claude', 'projects')
  let projectDirs: string[]
  try {
    projectDirs = await readdir(projectsDir)
  } catch {
    return []
  }

  const entries: FileEntry[] = []
  for (const projectDir of projectDirs) {
    const fullProjectDir = join(projectsDir, projectDir)
    let files: string[]
    try {
      files = await readdir(fullProjectDir)
    } catch {
      continue
    }
    for (const file of files) {
      if (!file.endsWith('.jsonl')) continue
      const filePath = join(fullProjectDir, file)
      try {
        const stats = await stat(filePath)
        if (!stats.isFile()) continue
        entries.push({ id: file.slice(0, -'.jsonl'.length), path: filePath, mtimeMs: stats.mtimeMs })
      } catch {
        continue
      }
    }
  }
  return entries
}

interface ParsedPreview {
  cwd: string
  preview: string
}

function extractText(content: unknown): string | null {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    const block = content.find(
      (b): b is { type: 'text'; text: string } =>
        typeof b === 'object' && b !== null && (b as { type?: unknown }).type === 'text'
    )
    return block?.text ?? null
  }
  return null
}

async function parsePreview(filePath: string): Promise<ParsedPreview> {
  const rl = createInterface({ input: createReadStream(filePath, { encoding: 'utf-8' }) })
  let cwd = ''
  let preview = ''
  let lineCount = 0

  try {
    for await (const line of rl) {
      lineCount++
      if (lineCount > PREVIEW_LINE_CAP) break
      let obj: Record<string, unknown>
      try {
        obj = JSON.parse(line)
      } catch {
        continue
      }
      if (!cwd && typeof obj.cwd === 'string') cwd = obj.cwd

      if (preview) continue
      if (obj.type !== 'user' || obj.isMeta) continue
      const message = obj.message as { content?: unknown } | undefined
      const text = extractText(message?.content)
      if (!text) continue
      const trimmed = text.trim()
      if (!trimmed || /^<(command-name|local-command)/.test(trimmed)) continue
      preview = trimmed.slice(0, PREVIEW_MAX_CHARS)

      if (cwd && preview) break
    }
  } finally {
    rl.close()
  }

  return { cwd, preview: preview || '(pas d’aperçu)' }
}

function projectLabelFromCwd(cwd: string): string {
  if (!cwd) return 'Dossier inconnu'
  const normalized = cwd.replace(/[/\\]+$/, '')
  const segments = normalized.split(/[/\\]/)
  return segments[segments.length - 1] || normalized
}

export async function listSessions(): Promise<SessionSummary[]> {
  const files = await findSessionFiles()
  const pinnedIds = new Set(loadPinnedSessionIds())

  files.sort((a, b) => b.mtimeMs - a.mtimeMs)

  const recent = files.slice(0, RECENT_WINDOW)
  const pinnedOutsideWindow = files.filter(
    (f) => pinnedIds.has(f.id) && !recent.some((r) => r.id === f.id)
  )
  const toParse = [...recent, ...pinnedOutsideWindow]

  const summaries = await Promise.all(
    toParse.map(async (entry) => {
      const { cwd, preview } = await parsePreview(entry.path)
      const summary: SessionSummary = {
        id: entry.id,
        cwd,
        projectLabel: projectLabelFromCwd(cwd),
        preview,
        updatedAt: entry.mtimeMs,
        pinned: pinnedIds.has(entry.id)
      }
      return summary
    })
  )

  summaries.sort((a, b) => b.updatedAt - a.updatedAt)
  return summaries
}
