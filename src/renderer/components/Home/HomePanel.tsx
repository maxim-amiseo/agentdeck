import { useEffect, useState } from 'react'
import { useFocusArbiter } from '../Dictation/useFocusArbiter'
import type { SessionStats } from '../../../shared/types'

const CLOSE_ANIMATION_MS = 200

interface HomePanelProps {
  open: boolean
  onClose: () => void
}

const FUN_FACTS: Array<(stats: SessionStats) => string | null> = [
  (s) => (s.totalSizeMB > 0 ? `Ça pèse environ ${s.totalSizeMB} Mo de conversations.` : null),
  (s) => (s.streakDays >= 2 ? `Tu es sur une série de ${s.streakDays} jours d'affilée.` : null),
  (s) => (s.sessionsThisWeek > 0 ? `${s.sessionsThisWeek} sessions cette semaine.` : null)
]

export default function HomePanel({ open, onClose }: HomePanelProps) {
  const enterChromeMode = useFocusArbiter((s) => s.enterChromeMode)
  const enterDictationMode = useFocusArbiter((s) => s.enterDictationMode)

  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState<SessionStats | null>(null)

  useEffect(() => {
    if (open) {
      setMounted(true)
      enterChromeMode()
      window.api.getSessionStats().then(setStats)
    } else {
      enterDictationMode()
      const timer = setTimeout(() => setMounted(false), CLOSE_ANIMATION_MS)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!mounted) return null

  const facts = stats ? FUN_FACTS.map((f) => f(stats)).filter((f): f is string => Boolean(f)) : []

  return (
    <div
      data-chrome-surface="true"
      className={`absolute inset-0 z-20 flex justify-end bg-black/40 transition-opacity duration-200 ease-[var(--ease-out-quart)] ${
        open ? 'opacity-100' : 'opacity-0'
      }`}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`h-full w-80 overflow-y-auto border-l border-[var(--color-border)] bg-[var(--color-panel)] p-4 transition-transform duration-200 ease-[var(--ease-out-quart)] ${
          open ? 'translate-x-0' : 'translate-x-6'
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-dim)]">
            Accueil
          </h2>
          <button
            className="rounded-md px-1 text-[var(--color-text-dim)] transition-colors duration-150 hover:text-[var(--color-text)]"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {!stats ? (
          <p className="text-xs text-[var(--color-text-dim)]">Chargement…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-[var(--color-border)] p-3">
                <div className="text-2xl font-semibold text-[var(--color-text)]">{stats.totalSessions}</div>
                <div className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">Sessions</div>
              </div>
              <div className="rounded-lg border border-[var(--color-border)] p-3">
                <div className="text-2xl font-semibold text-[var(--color-text)]">{stats.sessionsThisWeek}</div>
                <div className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">Cette semaine</div>
              </div>
              <div className="rounded-lg border border-[var(--color-border)] p-3">
                <div className="text-2xl font-semibold text-[var(--color-text)]">{stats.streakDays}</div>
                <div className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">Jours de série</div>
              </div>
              <div className="rounded-lg border border-[var(--color-border)] p-3">
                <div className="text-2xl font-semibold text-[var(--color-text)]">{stats.totalSizeMB}</div>
                <div className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">Mo au total</div>
              </div>
            </div>

            {facts.length > 0 && (
              <div className="mt-4 space-y-1.5 border-t border-[var(--color-border)] pt-3">
                {facts.map((fact, i) => (
                  <p key={i} className="text-xs text-[var(--color-text-dim)]">
                    {fact}
                  </p>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
