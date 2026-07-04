import { useEffect } from 'react'
import { useAgentsStore } from '../../state/agentsStore'
import { useSessionsStore } from '../../state/sessionsStore'
import { useRoutingFlash } from '../Dictation/routingFlashStore'
import { uniqueName } from '../../lib/relativeTime'
import AgentListItem from './AgentListItem'
import HistoryRow from './HistoryRow'
import type { Agent, SessionSummary } from '../../../shared/types'

interface OpenEntry {
  kind: 'open'
  timestamp: number
  pinned: boolean
  agent: Agent
}

interface ClosedEntry {
  kind: 'closed'
  timestamp: number
  pinned: boolean
  session: SessionSummary
}

type Entry = OpenEntry | ClosedEntry

export default function ConversationsList() {
  const agents = useAgentsStore((s) => s.agents)
  const activeAgentId = useAgentsStore((s) => s.activeAgentId)
  const setActiveAgent = useAgentsStore((s) => s.setActiveAgent)
  const createAgent = useAgentsStore((s) => s.createAgent)
  const flashedAgentId = useRoutingFlash((s) => s.flashedAgentId)

  const sessions = useSessionsStore((s) => s.sessions)
  const loading = useSessionsStore((s) => s.loading)
  const load = useSessionsStore((s) => s.load)
  const togglePin = useSessionsStore((s) => s.togglePin)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sessionById = new Map(sessions.map((s) => [s.id, s]))
  const openSessionIds = new Set(agents.filter((a) => a.resumeSessionId).map((a) => a.resumeSessionId as string))

  const openEntries: OpenEntry[] = agents.map((agent) => {
    const linked = agent.resumeSessionId ? sessionById.get(agent.resumeSessionId) : undefined
    return {
      kind: 'open',
      agent,
      pinned: linked?.pinned ?? false,
      timestamp: linked?.updatedAt ?? agent.createdAt
    }
  })

  const closedEntries: ClosedEntry[] = sessions
    .filter((s) => !openSessionIds.has(s.id))
    .map((session) => ({ kind: 'closed', session, pinned: session.pinned, timestamp: session.updatedAt }))

  const all = [...openEntries, ...closedEntries]
  const pinned = all.filter((e) => e.pinned).sort((a, b) => b.timestamp - a.timestamp)
  const recent = all.filter((e) => !e.pinned).sort((a, b) => b.timestamp - a.timestamp)

  const resumeSession = async (session: SessionSummary): Promise<void> => {
    const taken = new Set(agents.map((a) => a.name.toLowerCase()))
    const name = uniqueName(session.projectLabel, taken)
    await createAgent({ name, cwd: session.cwd, resumeSessionId: session.id })
  }

  const renderEntry = (entry: Entry): React.JSX.Element =>
    entry.kind === 'open' ? (
      <AgentListItem
        key={entry.agent.id}
        agent={entry.agent}
        isActive={entry.agent.id === activeAgentId}
        flash={entry.agent.id === flashedAgentId}
      />
    ) : (
      <HistoryRow
        key={entry.session.id}
        session={entry.session}
        busy={false}
        onOpen={() => resumeSession(entry.session)}
        onTogglePin={() => togglePin(entry.session.id)}
      />
    )

  const isEmpty = !loading && all.length === 0

  return (
    <div className="scroll-thin min-h-0 flex-1 space-y-3 overflow-y-auto">
      {pinned.length > 0 && (
        <div>
          <h3 className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-dim)]">
            Épinglées
          </h3>
          <div className="space-y-0.5">{pinned.map(renderEntry)}</div>
        </div>
      )}

      <div>
        <h3 className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-dim)]">
          Récentes
        </h3>
        <div className="space-y-0.5">{recent.map(renderEntry)}</div>
        {isEmpty && (
          <p className="px-1 py-3 text-center text-xs text-[var(--color-text-dim)]">
            Aucune conversation. Crée un agent pour commencer.
          </p>
        )}
      </div>
    </div>
  )
}
