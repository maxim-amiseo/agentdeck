import { useEffect } from 'react'
import type { Terminal } from '@xterm/xterm'
import type { FitAddon } from '@xterm/addon-fit'

/**
 * Fits the terminal to its container and syncs cols/rows to the PTY.
 * Only meaningful for the currently visible pane — inactive panes skip
 * resizing until they're activated (see TerminalPane).
 */
export function useTerminalResize(
  agentId: string,
  terminal: Terminal | null,
  fitAddon: FitAddon | null,
  container: HTMLElement | null,
  isActive: boolean
): void {
  useEffect(() => {
    if (!terminal || !fitAddon || !isActive) return

    const fit = (): void => {
      fitAddon.fit()
      window.api.resizePty(agentId, terminal.cols, terminal.rows)
    }

    fit()
    window.addEventListener('resize', fit)

    const observer = container ? new ResizeObserver(() => fit()) : null
    if (container && observer) observer.observe(container)

    return () => {
      window.removeEventListener('resize', fit)
      observer?.disconnect()
    }
  }, [agentId, terminal, fitAddon, container, isActive])
}
