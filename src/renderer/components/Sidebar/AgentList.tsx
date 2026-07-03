import { useEffect, useRef, useState } from 'react'
import { useAgentsStore } from '../../state/agentsStore'
import { useRoutingFlash } from '../Dictation/routingFlashStore'
import { useUiStore } from '../../state/uiStore'
import AgentListItem from './AgentListItem'
import NewAgentButton from './NewAgentButton'

export default function AgentList() {
  const agents = useAgentsStore((s) => s.agents)
  const activeAgentId = useAgentsStore((s) => s.activeAgentId)
  const load = useAgentsStore((s) => s.load)
  const applyStatus = useAgentsStore((s) => s.applyStatus)
  const flashedAgentId = useRoutingFlash((s) => s.flashedAgentId)

  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const sidebarWidth = useUiStore((s) => s.sidebarWidth)
  const setSidebarWidth = useUiStore((s) => s.setSidebarWidth)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    load()
    const unsubscribe = window.api.onAgentStatusChanged((agent) => applyStatus(agent))
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onResizeMouseDown = (e: React.MouseEvent): void => {
    e.preventDefault()
    setIsDragging(true)
    const startX = e.clientX
    const startWidth = sidebarWidth

    const onMouseMove = (ev: MouseEvent): void => setSidebarWidth(startWidth + (ev.clientX - startX))
    const onMouseUp = (): void => {
      setIsDragging(false)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  return (
    <aside
      className={`relative flex h-full shrink-0 bg-[var(--color-panel)] ${
        collapsed ? '' : 'border-r border-[var(--color-border)]'
      }`}
      style={{
        width: collapsed ? 0 : sidebarWidth,
        transition: isDragging ? 'none' : 'width 220ms var(--ease-out-quart)'
      }}
    >
      <div className="flex h-full min-w-0 flex-1 flex-col gap-2 overflow-hidden p-2 pt-2.5">
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
          {agents.map((agent) => (
            <AgentListItem
              key={agent.id}
              agent={agent}
              isActive={agent.id === activeAgentId}
              flash={agent.id === flashedAgentId}
            />
          ))}
          {agents.length === 0 && (
            <p className="px-1 py-4 text-center text-xs text-[var(--color-text-dim)]">
              Aucun agent, crée-en un pour commencer.
            </p>
          )}
        </div>
        <NewAgentButton />
      </div>

      {!collapsed && (
        <div
          className="absolute -right-1.5 top-0 z-10 h-full w-3 shrink-0 cursor-col-resize"
          onMouseDown={onResizeMouseDown}
        >
          <div className="mx-auto h-full w-px bg-transparent transition-colors duration-150 hover:bg-[var(--color-accent)]" />
        </div>
      )}
    </aside>
  )
}
