import { useState } from 'react'
import type { Agent } from '../../../shared/types'
import { useAgentsStore } from '../../state/agentsStore'
import { useFocusArbiter } from '../Dictation/useFocusArbiter'

const STATUS_COLOR: Record<Agent['status'], string> = {
  idle: 'bg-[var(--color-status-idle)]',
  running: 'bg-[var(--color-status-running)]',
  exited: 'bg-[var(--color-status-exited)]'
}

interface AgentListItemProps {
  agent: Agent
  isActive: boolean
  flash: boolean
}

export default function AgentListItem({ agent, isActive, flash }: AgentListItemProps) {
  const setActiveAgent = useAgentsStore((s) => s.setActiveAgent)
  const renameAgent = useAgentsStore((s) => s.renameAgent)
  const deleteAgent = useAgentsStore((s) => s.deleteAgent)
  const restartAgent = useAgentsStore((s) => s.restartAgent)
  const enterChromeMode = useFocusArbiter((s) => s.enterChromeMode)
  const enterDictationMode = useFocusArbiter((s) => s.enterDictationMode)

  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState(agent.name)
  const [menuOpen, setMenuOpen] = useState(false)

  const commitRename = (): void => {
    setEditing(false)
    enterDictationMode()
    const trimmed = draftName.trim()
    if (trimmed && trimmed !== agent.name) renameAgent(agent.id, trimmed)
    else setDraftName(agent.name)
  }

  return (
    <div
      className={`group relative flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-[background-color,box-shadow] duration-150 ease-[var(--ease-out-quart)] ${
        isActive ? 'bg-[var(--color-panel-hover)]' : 'hover:bg-[var(--color-panel-hover)]/60'
      } ${flash ? 'ring-1 ring-[var(--color-accent)]' : ''}`}
      onClick={() => setActiveAgent(agent.id)}
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full transition-colors duration-150 ${STATUS_COLOR[agent.status]} ${
          agent.status === 'running' ? 'animate-pulse-dot' : ''
        }`}
      />

      {editing ? (
        <input
          autoFocus
          className="min-w-0 flex-1 rounded-md bg-[var(--color-bg)] px-1 py-0.5 text-sm text-[var(--color-text)] outline-none ring-1 ring-[var(--color-accent)]"
          value={draftName}
          onFocus={() => enterChromeMode()}
          onChange={(e) => setDraftName(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename()
            if (e.key === 'Escape') {
              setDraftName(agent.name)
              setEditing(false)
              enterDictationMode()
            }
          }}
        />
      ) : (
        <span
          className="min-w-0 flex-1 truncate text-sm"
          onDoubleClick={(e) => {
            e.stopPropagation()
            setEditing(true)
          }}
        >
          {agent.name}
        </span>
      )}

      <button
        className="shrink-0 rounded-md px-1 text-[var(--color-text-dim)] opacity-0 transition-[opacity,color] duration-150 hover:text-[var(--color-text)] group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation()
          setMenuOpen((v) => !v)
        }}
      >
        ⋯
      </button>

      {menuOpen && (
        <div
          className="animate-fade-scale-in absolute right-0 top-full z-10 mt-1 w-36 origin-top-right overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] py-1 shadow-lg"
          onMouseLeave={() => setMenuOpen(false)}
        >
          <button
            className="block w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors duration-100 hover:bg-[var(--color-panel-hover)]"
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(false)
              setEditing(true)
            }}
          >
            Renommer
          </button>
          <button
            className="block w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors duration-100 hover:bg-[var(--color-panel-hover)]"
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(false)
              restartAgent(agent.id)
            }}
          >
            Redémarrer
          </button>
          <button
            className="block w-full rounded-md px-3 py-1.5 text-left text-sm text-[var(--color-status-exited)] transition-colors duration-100 hover:bg-[var(--color-panel-hover)]"
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(false)
              if (confirm(`Supprimer l'agent "${agent.name}" ?`)) deleteAgent(agent.id)
            }}
          >
            Supprimer
          </button>
        </div>
      )}
    </div>
  )
}
