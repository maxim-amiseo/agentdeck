import { useEffect } from 'react'
import type { Terminal } from '@xterm/xterm'
import { noteManualTypingActivity } from '../components/Dictation/useFocusArbiter'

/**
 * Wires an already-created xterm.js Terminal instance to a PTY identified by
 * agentId: hydrates scrollback on mount, streams live output, and forwards
 * user keystrokes/paste back to the PTY's stdin.
 */
export function usePtyStream(agentId: string, terminal: Terminal | null): void {
  useEffect(() => {
    if (!terminal) return

    let disposed = false

    window.api.getScrollback(agentId).then((scrollback) => {
      if (!disposed && scrollback) terminal.write(scrollback)
    })

    const unsubscribeData = window.api.onPtyData(({ agentId: id, chunk }) => {
      if (id === agentId) terminal.write(chunk)
    })

    const dataDisposable = terminal.onData((data) => {
      window.api.sendInput(agentId, data)
      noteManualTypingActivity(agentId, data)
    })

    return () => {
      disposed = true
      unsubscribeData()
      dataDisposable.dispose()
    }
  }, [agentId, terminal])
}
