import { useEffect, useState } from 'react'
import { useAgentsStore } from '../../state/agentsStore'
import { useSessionsStore } from '../../state/sessionsStore'
import { useUiStore } from '../../state/uiStore'
import { uniqueName } from '../../lib/relativeTime'
import { ChevronIcon } from '../icons/Icon'
import HistoryRow from './HistoryRow'
import type { SessionSummary } from '../../../shared/types'

export default function HistoryList() {
  const sessions = useSessionsStore((s) => s.sessions)
  const loading = useSessionsStore((s) => s.loading)
  const load = useSessionsStore((s) => s.load)
  const togglePin = useSessionsStore((s) => s.togglePin)

  const agents = useAgentsStore((s) => s.agents)
  const createAgent = useAgentsStore((s) => s.createAgent)
  const setActiveAgent = useAgentsStore((s) => s.setActiveAgent)

  const collapsed = useUiStore((s) => s.historyCollapsed)
  const toggleHistory = useUiStore((s) => s.toggleHistory)

  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openAgentBySession = new Map(agents.filter((a) => a.resumeSessionId).map((a) => [a.resumeSessionId, a.id]))

  const open = async (session: SessionSummary): Promise<void> => {
    const existingAgentId = openAgentBySession.get(session.id)
    if (existingAgentId) {
      setActiveAgent(existingAgentId)
      return
    }
    setBusyId(session.id)
    try {
      const taken = new Set(agents.map((a) => a.name.toLowerCase()))
      const name = uniqueName(session.projectLabel, taken)
      await createAgent({ name, cwd: session.cwd, resumeSessionId: session.id })
    } finally {
      setBusyId(null)
    }
  }

  const pinned = sessions.filter((s) => s.pinned)
  const recent = sessions.filter((s) => !s.pinned)

  return (
    <div className="flex min-h-0 flex-1 flex-col border-t border-[var(--color-border)] pt-2">
      <button
        className="flex shrink-0 items-center gap-1.5 rounded-md px-1 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-dim)] transition-colors duration-150 hover:text-[var(--color-text)]"
        onClick={toggleHistory}
      >
        <ChevronIcon direction={collapsed ? 'right' : 'down'} />
        Historique
        {sessions.length > 0 && <span className="text-[var(--color-text-dim)]">({sessions.length})</span>}
      </button>

      {!collapsed && (
        <div className="scroll-thin mt-1 min-h-0 flex-1 space-y-0.5 overflow-y-auto">
          {loading && sessions.length === 0 && (
            <p className="px-2 py-3 text-center text-xs text-[var(--color-text-dim)]">Chargement…</p>
          )}
          {pinned.map((s) => (
            <HistoryRow
              key={s.id}
              session={s}
              busy={busyId === s.id}
              isOpenAsAgent={openAgentBySession.has(s.id)}
              onOpen={() => open(s)}
              onTogglePin={() => togglePin(s.id)}
            />
          ))}
          {recent.map((s) => (
            <HistoryRow
              key={s.id}
              session={s}
              busy={busyId === s.id}
              isOpenAsAgent={openAgentBySession.has(s.id)}
              onOpen={() => open(s)}
              onTogglePin={() => togglePin(s.id)}
            />
          ))}
          {!loading && sessions.length === 0 && (
            <p className="px-2 py-3 text-center text-xs text-[var(--color-text-dim)]">Aucune session trouvée.</p>
          )}
        </div>
      )}
    </div>
  )
}
