import type { SessionSummary } from '../../../shared/types'
import { StarIcon } from '../icons/Icon'
import { relativeTime } from '../../lib/relativeTime'

interface HistoryRowProps {
  session: SessionSummary
  busy: boolean
  onOpen: () => void
  onTogglePin: () => void
}

export default function HistoryRow({ session, busy, onOpen, onTogglePin }: HistoryRowProps) {
  return (
    <div
      className="group flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 transition-colors duration-150 hover:bg-[var(--color-panel-hover)]/60"
      onClick={() => !busy && onOpen()}
    >
      <button
        className={`mt-0.5 shrink-0 transition-colors duration-150 ${
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
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 min-w-0 flex-1 text-xs leading-snug text-[var(--color-text)]">
          {session.preview}
        </p>
        <div className="mt-0.5 text-[10px] text-[var(--color-text-dim)]">
          {busy ? 'Ouverture…' : relativeTime(session.updatedAt)}
        </div>
      </div>
    </div>
  )
}
