import { useEffect } from 'react'
import { useUpdateStore } from '../../state/updateStore'

export default function UpdateBanner() {
  const status = useUpdateStore((s) => s.status)
  const version = useUpdateStore((s) => s.version)
  const setAvailable = useUpdateStore((s) => s.setAvailable)
  const setDownloaded = useUpdateStore((s) => s.setDownloaded)
  const setError = useUpdateStore((s) => s.setError)

  useEffect(() => {
    const unsubAvailable = window.api.onUpdateAvailable(setAvailable)
    const unsubDownloaded = window.api.onUpdateDownloaded(setDownloaded)
    const unsubError = window.api.onUpdateError(setError)
    return () => {
      unsubAvailable()
      unsubDownloaded()
      unsubError()
    }
  }, [setAvailable, setDownloaded, setError])

  if (status === 'idle' || status === 'error') return null

  return (
    <div className="animate-slide-in-right flex shrink-0 items-center justify-between gap-3 border-t border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1.5 text-xs">
      {status === 'available' && (
        <span className="text-[var(--color-text-dim)]">
          Téléchargement de la mise à jour {version}…
        </span>
      )}
      {status === 'downloaded' && (
        <>
          <span className="text-[var(--color-text)]">Mise à jour {version} prête à installer</span>
          <button
            className="shrink-0 rounded-md bg-[var(--color-accent)] px-2.5 py-1 text-xs text-[#0b0d10] transition-[opacity,transform] duration-150 active:scale-95"
            onClick={() => window.api.installUpdate()}
          >
            Redémarrer et installer
          </button>
        </>
      )}
    </div>
  )
}
