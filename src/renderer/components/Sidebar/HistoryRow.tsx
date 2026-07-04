import type { SessionSummary } from '../../../shared/types'
import { StarIcon } from '../icons/Icon'
import { relativeTime } from '../../lib/relativeTime'

interface HistoryRowProps {
  session: SessionSummary
  busy: boolean
  isOpenAsAgent: boolean
  onOpen: () => void
  onTogglePin: () => void
}

export default function HistoryRow({ session, busy, isOpenAsAgent, onOpen, onTogglePin }: HistoryRowProps) {
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
        <div className="flex items-center gap-1.5">
          {isOpenAsAgent && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-status-running)]" title="Déjà ouvert" />
          )}
          <span className="truncate text-xs font-medium text-[var(--color-text)]">{session.projectLabel}</span>
          <span className="ml-auto shrink-0 text-[10px] text-[var(--color-text-dim)]">
            {busy ? 'Ouverture…' : relativeTime(session.updatedAt)}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[var(--color-text-dim)]">{session.preview}</p>
      </div>
    </div>
  )
}
