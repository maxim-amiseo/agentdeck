import { useState } from 'react'
import { useAgentsStore } from '../../state/agentsStore'
import { randomFrenchName } from '../../lib/frenchNames'

export default function NewAgentButton() {
  const agents = useAgentsStore((s) => s.agents)
  const createAgent = useAgentsStore((s) => s.createAgent)
  const [busy, setBusy] = useState(false)

  const create = async (): Promise<void> => {
    if (busy) return
    setBusy(true)
    try {
      const taken = new Set(agents.map((a) => a.name.toLowerCase()))
      await createAgent({ name: randomFrenchName(taken) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      disabled={busy}
      className="w-full rounded-lg border border-dashed border-[var(--color-border)] py-1.5 text-sm text-[var(--color-text-dim)] transition-[border-color,color] duration-150 ease-[var(--ease-out-quart)] hover:border-[var(--color-accent)] hover:text-[var(--color-text)] active:scale-[0.98] disabled:opacity-40"
      onClick={create}
    >
      {busy ? 'Création…' : '+ Nouvelle session'}
    </button>
  )
}
