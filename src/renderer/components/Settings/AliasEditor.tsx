import { useState } from 'react'
import type { Agent } from '../../../shared/types'
import { useAgentsStore } from '../../state/agentsStore'
import { useFocusArbiter } from '../Dictation/useFocusArbiter'

interface AliasEditorProps {
  agent: Agent
}

export default function AliasEditor({ agent }: AliasEditorProps) {
  const enterChromeMode = useFocusArbiter((s) => s.enterChromeMode)
  const setAliases = useAgentsStore((s) => s.setAliases)
  const [value, setValue] = useState(agent.aliases.join(', '))

  const commit = (): void => {
    const aliases = value
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean)
    setAliases(agent.id, aliases)
  }

  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-28 shrink-0 truncate text-sm">{agent.name}</span>
      <input
        className="min-w-0 flex-1 rounded-md bg-[var(--color-bg)] px-2 py-1 text-xs outline-none ring-1 ring-transparent transition-shadow duration-150 focus:ring-[var(--color-accent)]"
        placeholder="alias, alias..."
        value={value}
        onFocus={() => enterChromeMode()}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
      />
    </div>
  )
}
