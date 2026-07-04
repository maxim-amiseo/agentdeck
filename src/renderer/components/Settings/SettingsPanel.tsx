import { useEffect, useState } from 'react'
import { useAgentsStore } from '../../state/agentsStore'
import { useSettingsStore } from '../../state/settingsStore'
import { useFocusArbiter } from '../Dictation/useFocusArbiter'
import { useUpdateStore } from '../../state/updateStore'
import AliasEditor from './AliasEditor'

const CLOSE_ANIMATION_MS = 200

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

export default function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const settings = useSettingsStore((s) => s.settings)
  const load = useSettingsStore((s) => s.load)
  const update = useSettingsStore((s) => s.update)
  const agents = useAgentsStore((s) => s.agents)
  const enterChromeMode = useFocusArbiter((s) => s.enterChromeMode)
  const enterDictationMode = useFocusArbiter((s) => s.enterDictationMode)
  const updateStatus = useUpdateStore((s) => s.status)

  const [mounted, setMounted] = useState(false)
  const [checking, setChecking] = useState(false)
  const [checkedJustNow, setCheckedJustNow] = useState(false)
  const [checkError, setCheckError] = useState<string | null>(null)

  useEffect(() => {
    const unsubNotAvailable = window.api.onUpdateNotAvailable(() => {
      setChecking(false)
      setCheckError(null)
      setCheckedJustNow(true)
      setTimeout(() => setCheckedJustNow(false), 4000)
    })
    const unsubError = window.api.onUpdateError((message) => {
      setChecking(false)
      setCheckError(message)
      setTimeout(() => setCheckError(null), 5000)
    })
    return () => {
      unsubNotAvailable()
      unsubError()
    }
  }, [])

  useEffect(() => {
    if (updateStatus !== 'idle') setChecking(false)
  }, [updateStatus])

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

  return (
    <div
      data-chrome-surface="true"
      className={`absolute inset-0 z-20 flex justify-end bg-black/40 transition-opacity duration-200 ease-[var(--ease-out-quart)] ${
        open ? 'opacity-100' : 'opacity-0'
      }`}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`h-full w-96 overflow-y-auto border-l border-[var(--color-border)] bg-[var(--color-panel)] p-4 transition-transform duration-200 ease-[var(--ease-out-quart)] ${
          open ? 'translate-x-0' : 'translate-x-6'
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-dim)]">
            Réglages
          </h2>
          <button
            className="rounded-md px-1 text-[var(--color-text-dim)] transition-colors duration-150 hover:text-[var(--color-text)]"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <section className="mb-6 space-y-3">
          <label className="flex items-center justify-between text-sm">
            Routage vocal (Whisperflow)
            <input
              type="checkbox"
              className="accent-[var(--color-accent)]"
              checked={settings.dictationRoutingEnabled}
              onChange={(e) => update({ dictationRoutingEnabled: e.target.checked })}
            />
          </label>

          <label className="block text-sm">
            Debounce fin de phrase ({settings.debounceMs} ms)
            <input
              type="range"
              min={300}
              max={2000}
              step={50}
              value={settings.debounceMs}
              onChange={(e) => update({ debounceMs: Number(e.target.value) })}
              className="w-full accent-[var(--color-accent)]"
            />
          </label>

          <label className="block text-sm">
            Tolérance du matching flou ({settings.fuzzyMatchThreshold})
            <input
              type="range"
              min={0}
              max={4}
              step={1}
              value={settings.fuzzyMatchThreshold}
              onChange={(e) => update({ fuzzyMatchThreshold: Number(e.target.value) })}
              className="w-full accent-[var(--color-accent)]"
            />
          </label>

          <label className="block text-sm">
            Dossier de travail par défaut
            <div className="mt-1 flex gap-1">
              <input
                className="min-w-0 flex-1 rounded-md bg-[var(--color-bg)] px-2 py-1 text-xs outline-none ring-1 ring-transparent transition-shadow duration-150 focus:ring-[var(--color-accent)]"
                placeholder="C:\Users\...\projets"
                value={settings.defaultCwd}
                onChange={(e) => update({ defaultCwd: e.target.value })}
              />
              <button
                type="button"
                className="shrink-0 rounded-md border border-[var(--color-border)] px-2 text-xs text-[var(--color-text-dim)] transition-colors duration-150 hover:text-[var(--color-text)]"
                onClick={async () => {
                  const picked = await window.api.pickDirectory()
                  if (picked) update({ defaultCwd: picked })
                }}
              >
                Parcourir…
              </button>
            </div>
          </label>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-dim)]">
            Alias par agent (pour la reconnaissance vocale)
          </h3>
          <div className="space-y-1">
            {agents.map((agent) => (
              <AliasEditor key={agent.id} agent={agent} />
            ))}
            {agents.length === 0 && (
              <p className="text-xs text-[var(--color-text-dim)]">Aucun agent pour l'instant.</p>
            )}
          </div>
        </section>

        <section className="mt-6 border-t border-[var(--color-border)] pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-dim)]">
              {checkedJustNow ? 'À jour' : 'Mises à jour'}
            </span>
            <button
              type="button"
              disabled={checking}
              className="rounded-md border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text-dim)] transition-colors duration-150 hover:text-[var(--color-text)] disabled:opacity-40"
              onClick={() => {
                setChecking(true)
                setCheckError(null)
                window.api.checkForUpdates()
              }}
            >
              {checking ? 'Recherche…' : 'Vérifier les mises à jour'}
            </button>
          </div>
          {checkError && <p className="mt-1.5 text-xs text-[var(--color-status-exited)]">{checkError}</p>}
        </section>
      </div>
    </div>
  )
}
