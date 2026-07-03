import { useEffect, useState } from 'react'
import AgentList from './components/Sidebar/AgentList'
import TerminalPane from './components/Terminal/TerminalPane'
import DictationCaptureInput from './components/Dictation/DictationCaptureInput'
import SettingsPanel from './components/Settings/SettingsPanel'
import SessionsPanel from './components/Sessions/SessionsPanel'
import TitleBar from './components/TitleBar/TitleBar'
import UpdateBanner from './components/Update/UpdateBanner'
import { useAgentsStore } from './state/agentsStore'
import { useSettingsStore } from './state/settingsStore'
import { useUiStore } from './state/uiStore'
import type { Agent } from '../shared/types'

const STATUS_COLOR: Record<Agent['status'], string> = {
  idle: 'bg-[var(--color-status-idle)]',
  running: 'bg-[var(--color-status-running)]',
  exited: 'bg-[var(--color-status-exited)]'
}

export default function App() {
  const agents = useAgentsStore((s) => s.agents)
  const activeAgentId = useAgentsStore((s) => s.activeAgentId)
  const setActiveAgent = useAgentsStore((s) => s.setActiveAgent)
  const loadSettings = useSettingsStore((s) => s.load)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sessionsOpen, setSessionsOpen] = useState(false)

  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const viewMode = useUiStore((s) => s.viewMode)
  const toggleViewMode = useUiStore((s) => s.toggleViewMode)

  useEffect(() => {
    loadSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const gridCols = agents.length > 0 ? Math.ceil(Math.sqrt(agents.length)) : 1

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden">
      <TitleBar />

      <div className="flex min-h-0 flex-1">
        <AgentList />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-1.5 border-b border-[var(--color-border)] bg-[var(--color-panel)] px-1.5 py-1.5">
            <button
              className="shrink-0 rounded-md p-1.5 text-[var(--color-text-dim)] transition-colors duration-150 hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)] active:scale-95"
              onClick={toggleSidebar}
              title={sidebarCollapsed ? 'Afficher la barre latérale' : 'Masquer la barre latérale'}
            >
              ☰
            </button>
            <DictationCaptureInput />
            <button
              className="shrink-0 rounded-md p-1.5 text-[var(--color-text-dim)] transition-colors duration-150 hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)] active:scale-95"
              onClick={() => setSessionsOpen(true)}
              title="Sessions"
            >
              🕘
            </button>
            <button
              className={`shrink-0 rounded-md p-1.5 transition-colors duration-150 active:scale-95 ${
                viewMode === 'grid'
                  ? 'bg-[var(--color-panel-hover)] text-[var(--color-accent)]'
                  : 'text-[var(--color-text-dim)] hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)]'
              }`}
              onClick={toggleViewMode}
              title={viewMode === 'grid' ? 'Vue focus (un agent)' : 'Vue grille (tous les agents)'}
            >
              ⊞
            </button>
            <button
              className="shrink-0 rounded-md p-1.5 text-[var(--color-text-dim)] transition-colors duration-150 hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)] active:scale-95"
              onClick={() => setSettingsOpen(true)}
              title="Réglages"
            >
              ⚙
            </button>
          </div>

          {viewMode === 'grid' ? (
            <div
              key="grid"
              className="animate-fade-in grid min-h-0 flex-1 gap-1 overflow-auto p-1"
              style={{
                gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                gridAutoRows: 'minmax(0, 1fr)'
              }}
            >
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-[var(--color-border)] transition-[border-color] duration-150 hover:border-[var(--color-text-dim)]"
                >
                  <button
                    className="flex shrink-0 items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-1 text-left text-xs transition-colors duration-150 hover:bg-[var(--color-panel-hover)]"
                    onClick={() => {
                      setActiveAgent(agent.id)
                      toggleViewMode()
                    }}
                    title="Agrandir cet agent"
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_COLOR[agent.status]} ${
                        agent.status === 'running' ? 'animate-pulse-dot' : ''
                      }`}
                    />
                    <span className="truncate">{agent.name}</span>
                  </button>
                  <div className="relative min-h-0 flex-1">
                    <TerminalPane agentId={agent.id} isActive />
                  </div>
                </div>
              ))}
              {agents.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-[var(--color-text-dim)]">
                  <p className="text-sm">Aucun agent ouvert</p>
                  <p className="text-xs">Crée un agent nommé dans la barre latérale pour démarrer une session.</p>
                </div>
              )}
            </div>
          ) : (
            <div key="focus" className="animate-fade-in relative min-h-0 flex-1">
              {agents.map((agent) => (
                <TerminalPane key={agent.id} agentId={agent.id} isActive={agent.id === activeAgentId} />
              ))}
              {agents.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-[var(--color-text-dim)]">
                  <p className="text-sm">Aucun agent ouvert</p>
                  <p className="text-xs">Crée un agent nommé dans la barre latérale pour démarrer une session.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <UpdateBanner />

      <SessionsPanel open={sessionsOpen} onClose={() => setSessionsOpen(false)} />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
