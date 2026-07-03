import { useState } from 'react'
import { useAgentsStore } from '../../state/agentsStore'
import { useFocusArbiter } from '../Dictation/useFocusArbiter'

export default function NewAgentButton() {
  const createAgent = useAgentsStore((s) => s.createAgent)
  const enterChromeMode = useFocusArbiter((s) => s.enterChromeMode)
  const enterDictationMode = useFocusArbiter((s) => s.enterDictationMode)

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [aliases, setAliases] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const close = (): void => {
    setOpen(false)
    setName('')
    setAliases('')
    setError(null)
    enterDictationMode()
  }

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!name.trim() || busy) return
    setBusy(true)
    setError(null)
    try {
      await createAgent({
        name: name.trim(),
        aliases: aliases
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean)
      })
      close()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button
        className="w-full rounded-lg border border-dashed border-[var(--color-border)] py-1.5 text-sm text-[var(--color-text-dim)] transition-[border-color,color] duration-150 ease-[var(--ease-out-quart)] hover:border-[var(--color-accent)] hover:text-[var(--color-text)] active:scale-[0.98]"
        onClick={() => {
          setOpen(true)
          enterChromeMode()
        }}
      >
        + Nouvel agent
      </button>
    )
  }

  return (
    <form
      className="animate-fade-scale-in origin-bottom space-y-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-2"
      onSubmit={submit}
    >
      <input
        autoFocus
        placeholder="Nom (ex: Backend)"
        className="w-full rounded-md bg-[var(--color-bg)] px-2 py-1 text-sm outline-none ring-1 ring-transparent transition-shadow duration-150 focus:ring-[var(--color-accent)]"
        value={name}
        onFocus={() => enterChromeMode()}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && close()}
      />
      <input
        placeholder="Alias (séparés par des virgules)"
        className="w-full rounded-md bg-[var(--color-bg)] px-2 py-1 text-sm outline-none ring-1 ring-transparent transition-shadow duration-150 focus:ring-[var(--color-accent)]"
        value={aliases}
        onFocus={() => enterChromeMode()}
        onChange={(e) => setAliases(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && close()}
      />
      {error && <p className="animate-fade-in text-xs text-[var(--color-status-exited)]">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!name.trim() || busy}
          className="flex-1 rounded-md bg-[var(--color-accent)] py-1 text-sm text-[#0b0d10] transition-[opacity,transform] duration-150 disabled:opacity-40 active:scale-[0.98]"
        >
          Créer
        </button>
        <button
          type="button"
          className="flex-1 rounded-md border border-[var(--color-border)] py-1 text-sm transition-colors duration-150 hover:bg-[var(--color-panel-hover)] active:scale-[0.98]"
          onClick={close}
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
