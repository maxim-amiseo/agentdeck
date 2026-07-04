import { app } from 'electron'
import { createReadStream } from 'node:fs'
import { readdir, stat } from 'node:fs/promises'
import { createInterface } from 'node:readline'
import { join } from 'node:path'
import type { SessionSummary, SessionStats } from '../../shared/types'
import { loadPinnedSessionIds } from '../agents/agentStore'

/** How many of the most-recently-modified sessions get their preview text
 * parsed (cheap per-file, but no reason to do it for hundreds of old ones
 * the user will never scroll to). Pinned sessions are always included on
 * top of this window, regardless of age. */
const RECENT_WINDOW = 40
const PREVIEW_LINE_CAP = 60
const RAW_TEXT_MAX_CHARS = 400
const TITLE_MAX_CHARS = 60

/** Leading filler an utterance often opens with before the actual ask -
 * politeness, attention-getters, "could you" framing. Stripped so the
 * title starts on the actual subject instead of "Dis-moi, est-ce que...". */
const FILLER_PREFIX =
  /^(dis[- ]moi[, ]*|peux[- ]tu( stp| s'il te pla[iî]t)?[, ]*|pourrais[- ]tu[, ]*|j'aimerais( bien| savoir)?[, ]*|je voudrais[, ]*|est[- ]ce que tu peux[, ]*|merci de[, ]*|stp[, ]*|s'il te pla[iî]t[, ]*|salut[, ]*|bonjour[, ]*|hello[, ]*|hey[, ]*|ok[, ]*)+/i

/** Previews often lead with a file/path attachment reference before the
 * actual instruction (Whisperflow-dictated messages that drag a file in).
 * Drop it so the title reflects what's being asked, not the file path. */
const ATTACHMENT_PREFIX = /^@"[^"]*"\s*/

function deriveTitle(rawText: string): string {
  let text = rawText.trim()
  text = text.replace(ATTACHMENT_PREFIX, '').trim()
  text = text.replace(FILLER_PREFIX, '').trim()
  if (!text) text = rawText.trim()

  // Only treat '.'/'?'/'!' as a sentence end when followed by whitespace or
  // end-of-string, so URLs and domains (github.com/...) don't get cut mid-word.
  const match = text.match(/[.?!](?=\s|$)|\n/)
  const sentenceEnd = match ? match.index! : -1
  let title = sentenceEnd > 3 ? text.slice(0, sentenceEnd) : text

  if (title.length > TITLE_MAX_CHARS) title = `${title.slice(0, TITLE_MAX_CHARS).trim()}…`
  return title.charAt(0).toUpperCase() + title.slice(1)
}

interface FileEntry {
  id: string
  path: string
  mtimeMs: number
  sizeBytes: number
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
        entries.push({
          id: file.slice(0, -'.jsonl'.length),
          path: filePath,
          mtimeMs: stats.mtimeMs,
          sizeBytes: stats.size
        })
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
      preview = deriveTitle(trimmed.slice(0, RAW_TEXT_MAX_CHARS))

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

const DAY_MS = 24 * 60 * 60 * 1000

function dayKey(ms: number): string {
  return new Date(ms).toDateString()
}

function computeStreakDays(activeDays: Set<string>): number {
  let streak = 0
  let cursor = Date.now()
  while (activeDays.has(dayKey(cursor))) {
    streak++
    cursor -= DAY_MS
  }
  return streak
}

export async function computeSessionStats(): Promise<SessionStats> {
  const files = await findSessionFiles()
  const now = Date.now()
  const activeDays = new Set(files.map((f) => dayKey(f.mtimeMs)))

  return {
    totalSessions: files.length,
    sessionsThisWeek: files.filter((f) => now - f.mtimeMs < 7 * DAY_MS).length,
    streakDays: computeStreakDays(activeDays),
    totalSizeMB: Math.round((files.reduce((sum, f) => sum + f.sizeBytes, 0) / (1024 * 1024)) * 10) / 10
  }
}
