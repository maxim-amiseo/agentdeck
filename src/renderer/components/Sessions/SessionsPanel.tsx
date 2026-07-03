import { useEffect, useState } from 'react'
import { useAgentsStore } from '../../state/agentsStore'
import { useSessionsStore } from '../../state/sessionsStore'
import { useFocusArbiter } from '../Dictation/useFocusArbiter'
import type { SessionSummary } from '../../../shared/types'
import { relativeTime } from './relativeTime'

const CLOSE_ANIMATION_MS = 200

interface SessionsPanelProps {
  open: boolean
  onClose: () => void
}

function uniqueName(base: string, taken: Set<string>): string {
  let name = base
  let n = 2
  while (taken.has(name.toLowerCase())) {
    name = `${base} ${n}`
    n++
  }
  return name
}

export default function SessionsPanel({ open, onClose }: SessionsPanelProps) {
  const sessions = useSessionsStore((s) => s.sessions)
  const loading = useSessionsStore((s) => s.loading)
  const load = useSessionsStore((s) => s.load)
  const togglePin = useSessionsStore((s) => s.togglePin)

  const agents = useAgentsStore((s) => s.agents)
  const createAgent = useAgentsStore((s) => s.createAgent)

  const enterChromeMode = useFocusArbiter((s) => s.enterChromeMode)
  const enterDictationMode = useFocusArbiter((s) => s.enterDictationMode)

  const [mounted, setMounted] = useState(false)
  const [newName, setNewName] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setMounted(true)
      load()
      enterChromeMode()
    } else {
      enterDictationMode()
      const timer = setTimeout(() => setMounted(false), CLOSE_ANIMATION_MS)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!mounted) return null

  const takenNames = new Set(agents.map((a) => a.name.toLowerCase()))

  const startFresh = async (): Promise<void> => {
    const name = newName.trim() || uniqueName('Session', takenNames)
    if (takenNames.has(name.toLowerCase())) return
    await createAgent({ name })
    setNewName('')
    onClose()
  }

  const resume = async (session: SessionSummary): Promise<void> => {
    setBusyId(session.id)
    try {
      const name = uniqueName(session.projectLabel, takenNames)
      await createAgent({ name, cwd: session.cwd, resumeSessionId: session.id })
      onClose()
    } finally {
      setBusyId(null)
    }
  }

  const pinned = sessions.filter((s) => s.pinned)
  const recent = sessions.filter((s) => !s.pinned)

  const renderRow = (session: SessionSummary): React.JSX.Element => (
    <div
      key={session.id}
      className="group flex cursor-pointer items-start gap-2 rounded-lg px-2 py-2 transition-colors duration-150 hover:bg-[var(--color-panel-hover)]"
      onClick={() => busyId === null && resume(session)}
    >
      <button
        className={`shrink-0 pt-0.5 text-sm transition-colors duration-150 ${
          session.pinned
            ? 'text-[var(--color-accent)]'
            : 'text-[var(--color-text-dim)] opacity-0 hover:text-[var(--color-text)] group-hover:opacity-100'
        }`}
        onClick={(e) => {
          e.stopPropagation()
          togglePin(session.id)
        }}
        title={session.pinned ? 'Désépingler' : 'Épingler'}
      >
        {session.pinned ? '★' : '☆'}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs font-medium text-[var(--color-text)]">
            {session.projectLabel}
          </span>
          <span className="shrink-0 text-[10px] text-[var(--color-text-dim)]">
            {relativeTime(session.updatedAt)}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-[var(--color-text-dim)]">{session.preview}</p>
      </div>
      {busyId === session.id && (
        <span className="shrink-0 text-xs text-[var(--color-text-dim)]">Ouverture…</span>
      )}
    </div>
  )

  return (
    <div
      data-chrome-surface="true"
      className={`absolute inset-0 z-20 flex justify-end bg-black/40 transition-opacity duration-200 ease-[var(--ease-out-quart)] ${
        open ? 'opacity-100' : 'opacity-0'
      }`}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`flex h-full w-[26rem] flex-col overflow-hidden border-l border-[var(--color-border)] bg-[var(--color-panel)] p-4 transition-transform duration-200 ease-[var(--ease-out-quart)] ${
          open ? 'translate-x-0' : 'translate-x-6'
        }`}
      >
        <div className="mb-3 flex shrink-0 items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-dim)]">
            Sessions
          </h2>
          <button
            className="rounded-md px-1 text-[var(--color-text-dim)] transition-colors duration-150 hover:text-[var(--color-text)]"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="mb-4 flex shrink-0 gap-1">
          <input
            placeholder="Nom (optionnel)"
            className="min-w-0 flex-1 rounded-md bg-[var(--color-bg)] px-2 py-1.5 text-sm outline-none ring-1 ring-transparent transition-shadow duration-150 focus:ring-[var(--color-accent)]"
            value={newName}
            onFocus={() => enterChromeMode()}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && startFresh()}
          />
          <button
            className="shrink-0 rounded-md bg-[var(--color-accent)] px-3 text-sm text-[#0b0d10] transition-[opacity,transform] duration-150 active:scale-95"
            onClick={startFresh}
          >
            + Nouvelle
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading && sessions.length === 0 && (
            <p className="px-2 py-4 text-center text-xs text-[var(--color-text-dim)]">Chargement…</p>
          )}

          {pinned.length > 0 && (
            <div className="mb-3">
              <h3 className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-dim)]">
                Épinglées
              </h3>
              <div className="space-y-0.5">{pinned.map(renderRow)}</div>
            </div>
          )}

          <div>
            <h3 className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-dim)]">
              Récentes
            </h3>
            <div className="space-y-0.5">{recent.map(renderRow)}</div>
            {!loading && recent.length === 0 && pinned.length === 0 && (
              <p className="px-2 py-4 text-center text-xs text-[var(--color-text-dim)]">
                Aucune session trouvée.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
