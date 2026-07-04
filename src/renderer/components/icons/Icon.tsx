interface IconProps {
  className?: string
}

export function SidebarIcon({ className }: IconProps) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="1.5" y="2.5" width="13" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="6" y1="2.5" x2="6" y2="13.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

export function GridIcon({ className }: IconProps) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9" y="9" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M8 1.8v1.5M8 12.7v1.5M14.2 8h-1.5M3.3 8H1.8M12.3 3.7l-1.05 1.05M4.75 11.25L3.7 12.3M12.3 12.3l-1.05-1.05M4.75 4.75L3.7 3.7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ChevronIcon({ className, direction = 'down' }: IconProps & { direction?: 'down' | 'right' }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      className={className}
      style={{
        transform: direction === 'right' ? 'rotate(-90deg)' : 'none',
        transition: 'transform 150ms var(--ease-out-quart)'
      }}
    >
      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function StarIcon({ className, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M8 1.5l1.85 3.9 4.15.62-3 3.03.71 4.25L8 11.3l-3.71 2 .71-4.25-3-3.03 4.15-.62L8 1.5z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  )
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
