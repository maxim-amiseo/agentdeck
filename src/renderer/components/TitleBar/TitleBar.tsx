import { useEffect, useState } from 'react'

const dragStyle = { WebkitAppRegion: 'drag' } as React.CSSProperties
const noDragStyle = { WebkitAppRegion: 'no-drag' } as React.CSSProperties

function AppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 256 256" className="shrink-0">
      <defs>
        <linearGradient id="tb-bg" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#181d24" />
          <stop offset="1" stopColor="#0b0d10" />
        </linearGradient>
        <linearGradient id="tb-tile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9dc9ff" />
          <stop offset="1" stopColor="#5a8ee0" />
        </linearGradient>
      </defs>
      <rect width="256" height="256" rx="56" fill="url(#tb-bg)" />
      <rect x="56" y="56" width="66" height="66" rx="16" fill="url(#tb-tile)" />
      <rect x="134" y="56" width="66" height="66" rx="16" fill="url(#tb-tile)" opacity="0.5" />
      <rect x="56" y="134" width="66" height="66" rx="16" fill="url(#tb-tile)" opacity="0.5" />
      <rect x="134" y="134" width="66" height="66" rx="16" fill="url(#tb-tile)" />
      <circle cx="184" cy="162" r="10" fill="#4fd17a" stroke="#0b0d10" strokeWidth="5" />
    </svg>
  )
}

export default function TitleBar() {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    window.api.isWindowMaximized().then(setMaximized)
    return window.api.onWindowMaximizedChanged(setMaximized)
  }, [])

  return (
    <div
      className="flex h-8 shrink-0 select-none items-center border-b border-[var(--color-border)] bg-[var(--color-panel)]"
      style={dragStyle}
    >
      <div className="flex items-center gap-1.5 px-2.5 text-xs text-[var(--color-text-dim)]">
        <AppIcon />
        <span>AgentDeck</span>
      </div>

      <div className="flex-1" />

      <div className="flex h-full items-center gap-1 px-1.5" style={noDragStyle}>
        <button
          className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-text-dim)] transition-colors duration-100 hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)] active:scale-90"
          onClick={() => window.api.minimizeWindow()}
          title="Réduire"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <rect y="4.5" width="10" height="1" fill="currentColor" />
          </svg>
        </button>
        <button
          className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-text-dim)] transition-colors duration-100 hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)] active:scale-90"
          onClick={() => window.api.toggleMaximizeWindow()}
          title={maximized ? 'Restaurer' : 'Agrandir'}
        >
          {maximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect x="2" y="0.5" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect
                x="0.5"
                y="2.5"
                width="7"
                height="7"
                fill="var(--color-panel)"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect x="0.5" y="0.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          )}
        </button>
        <button
          className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-text-dim)] transition-colors duration-100 hover:bg-[#e5484d] hover:text-white active:scale-90"
          onClick={() => window.api.closeWindow()}
          title="Fermer"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <line x1="0.5" y1="0.5" x2="9.5" y2="9.5" stroke="currentColor" strokeWidth="1" />
            <line x1="9.5" y1="0.5" x2="0.5" y2="9.5" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
      </div>
    </div>
  )
}
