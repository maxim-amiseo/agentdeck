import type { Agent } from '../../../shared/types'

export interface RouteResult {
  targetAgentId: string
  promptText: string
  matchedBy: 'exact' | 'fuzzy' | 'fallback'
}

interface Token {
  word: string
  index: number
}

interface NameEntry {
  agentId: string
  normalized: string
}

function tokenize(text: string): Token[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' })
    const tokens: Token[] = []
    for (const s of segmenter.segment(text)) {
      if (s.isWordLike) tokens.push({ word: s.segment, index: s.index })
    }
    return tokens
  }
  const tokens: Token[] = []
  const re = /\S+/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    tokens.push({ word: m[0].replace(/[.,;:!?]+$/, ''), index: m.index })
  }
  return tokens
}

function buildNameIndex(agents: Agent[]): NameEntry[] {
  const entries: NameEntry[] = []
  for (const agent of agents) {
    entries.push({ agentId: agent.id, normalized: agent.name.trim().toLowerCase() })
    for (const alias of agent.aliases) {
      const normalized = alias.trim().toLowerCase()
      if (normalized) entries.push({ agentId: agent.id, normalized })
    }
  }
  return entries
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  const rows = a.length + 1
  const cols = b.length + 1
  const dist = Array.from({ length: rows }, (_, i) => [i, ...new Array(cols - 1).fill(0)])
  for (let j = 0; j < cols; j++) dist[0][j] = j
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dist[i][j] = Math.min(dist[i - 1][j] + 1, dist[i][j - 1] + 1, dist[i - 1][j - 1] + cost)
    }
  }
  return dist[rows - 1][cols - 1]
}

function sliceRemainder(text: string, tokens: Token[], consumedTokens: number): string {
  const next = tokens[consumedTokens]
  return next ? text.slice(next.index).trim() : ''
}

/** How many leading words can precede the agent name before we give up
 * looking. 2 means the name can start at word 0 ("Mathis, ...") or word 1
 * ("Ok Mathis, ..." / "Hé Maxim, ...") — tolerates one natural filler word
 * without scanning deep enough into the sentence to false-positive on a
 * content word that happens to match an agent's name. */
const MAX_NAME_START = 2

interface Candidate {
  normalized: string
  startPos: number
  span: number
  consumedTokens: number
}

/**
 * Parses one dictated utterance and decides which agent it should go to.
 *
 * - Exact match on the agent's name/alias, searched from the start of the
 *   utterance (tolerating one leading filler word), wins outright. The
 *   earliest, longest match wins if several are exact.
 * - Otherwise a fuzzy pass (Levenshtein distance) picks the best match, but
 *   only if it's unambiguous — a near-tie with a second agent falls through
 *   to the fallback rather than guessing wrong.
 * - Fallback: the whole utterance, untouched, goes to the currently active
 *   agent (so plain dictation with no name still works).
 */
export function parseUtterance(
  rawText: string,
  agents: Agent[],
  activeAgentId: string | null,
  fuzzyThreshold: number
): RouteResult | null {
  const text = rawText.trim()
  if (!text) return null

  const fallback = (): RouteResult | null =>
    activeAgentId ? { targetAgentId: activeAgentId, promptText: text, matchedBy: 'fallback' } : null

  if (agents.length === 0) return fallback()

  const tokens = tokenize(text)
  if (tokens.length === 0) return fallback()

  const index = buildNameIndex(agents)
  const candidates: Candidate[] = []
  for (let startPos = 0; startPos < Math.min(MAX_NAME_START, tokens.length); startPos++) {
    candidates.push({
      normalized: tokens[startPos].word.toLowerCase(),
      startPos,
      span: 1,
      consumedTokens: startPos + 1
    })
    if (startPos + 1 < tokens.length) {
      candidates.push({
        normalized: `${tokens[startPos].word} ${tokens[startPos + 1].word}`.toLowerCase(),
        startPos,
        span: 2,
        consumedTokens: startPos + 2
      })
    }
  }

  // Exact match: earliest position wins; the longer (2-word) span wins ties at the same position.
  const bySpecificity = [...candidates].sort((a, b) => a.startPos - b.startPos || b.span - a.span)
  for (const candidate of bySpecificity) {
    const exact = index.find((e) => e.normalized === candidate.normalized)
    if (exact) {
      return {
        targetAgentId: exact.agentId,
        promptText: sliceRemainder(text, tokens, candidate.consumedTokens),
        matchedBy: 'exact'
      }
    }
  }

  // Fuzzy match: best distance per agent, reject if the top two are too close.
  const bestPerAgent = new Map<string, { distance: number; consumedTokens: number }>()
  for (const candidate of candidates) {
    for (const entry of index) {
      const distance = levenshtein(candidate.normalized, entry.normalized)
      const current = bestPerAgent.get(entry.agentId)
      if (!current || distance < current.distance) {
        bestPerAgent.set(entry.agentId, { distance, consumedTokens: candidate.consumedTokens })
      }
    }
  }
  const ranked = Array.from(bestPerAgent.entries())
    .map(([agentId, v]) => ({ agentId, ...v }))
    .sort((a, b) => a.distance - b.distance)

  // Reject only on a genuine tie (or the runner-up being just as close) — a
  // clear best match (even by a single edit) should win, not get vetoed.
  const [first, second] = ranked
  if (first && first.distance <= fuzzyThreshold && (!second || second.distance > first.distance)) {
    return {
      targetAgentId: first.agentId,
      promptText: sliceRemainder(text, tokens, first.consumedTokens),
      matchedBy: 'fuzzy'
    }
  }

  return fallback()
}
