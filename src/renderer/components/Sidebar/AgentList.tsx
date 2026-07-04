import { useEffect, useState } from 'react'
import { useAgentsStore } from '../../state/agentsStore'
import { useUiStore } from '../../state/uiStore'
import NewAgentButton from './NewAgentButton'
import ConversationsList from './ConversationsList'

export default function AgentList() {
  const load = useAgentsStore((s) => s.load)
  const applyStatus = useAgentsStore((s) => s.applyStatus)

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
        <ConversationsList />
        <div className="shrink-0">
          <NewAgentButton />
        </div>
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
