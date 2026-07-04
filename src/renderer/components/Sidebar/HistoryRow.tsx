import type { SessionSummary } from '../../../shared/types'
import { StarIcon } from '../icons/Icon'

interface HistoryRowProps {
  session: SessionSummary
  busy: boolean
  onOpen: () => void
  onTogglePin: () => void
}

export default function HistoryRow({ session, busy, onOpen, onTogglePin }: HistoryRowProps) {
  return (
    <div
      className="group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors duration-150 hover:bg-[var(--color-panel-hover)]/60"
      onClick={() => !busy && onOpen()}
    >
      <button
        className={`shrink-0 transition-colors duration-150 ${
          session.pinned
            ? 'text-[var(--color-accent)]'
            : 'text-[var(--color-text-dim)] opacity-0 hover:text-[var(--color-text)] group-hover:opacity-100'
        }`}
        onClick={(e) => {
          e.stopPropagation()
          onTogglePin()
        }}
        title={session.pinned ? 'Désépingler' : 'Épingler'}
      >
        <StarIcon filled={session.pinned} />
      </button>
      <p className="min-w-0 flex-1 truncate text-xs text-[var(--color-text)]">
        {busy ? 'Ouverture…' : session.preview}
      </p>
    </div>
  )
}
