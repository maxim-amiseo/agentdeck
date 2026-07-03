import { useEffect, useRef, useState } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { usePtyStream } from '../../hooks/usePtyStream'
import { useTerminalResize } from '../../hooks/useTerminalResize'
import { useFocusArbiter } from '../Dictation/useFocusArbiter'

interface TerminalPaneProps {
  agentId: string
  isActive: boolean
}

export default function TerminalPane({ agentId, isActive }: TerminalPaneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [terminal, setTerminal] = useState<Terminal | null>(null)
  const [fitAddon, setFitAddon] = useState<FitAddon | null>(null)
  const enterManualTerminalMode = useFocusArbiter((s) => s.enterManualTerminalMode)

  useEffect(() => {
    if (!containerRef.current) return

    const term = new Terminal({
      cursorBlink: true,
      fontFamily: "Cascadia Code, Consolas, 'Courier New', monospace",
      fontSize: 13,
      theme: {
        background: '#121519',
        foreground: '#e6e8eb',
        cursor: '#6ea8ff'
      }
    })
    const fit = new FitAddon()
    term.loadAddon(fit)
    term.open(containerRef.current)

    // Ctrl+C copies the selection instead of sending SIGINT when text is
    // selected (matches Windows Terminal); Ctrl+V pastes from the OS
    // clipboard instead of relying on xterm's default paste handling.
    term.attachCustomKeyEventHandler((event) => {
      if (event.type !== 'keydown') return true
      const mod = event.ctrlKey || event.metaKey
      if (mod && event.key.toLowerCase() === 'c' && term.hasSelection()) {
        event.preventDefault()
        window.api.copyToClipboard(term.getSelection())
        return false
      }
      if (mod && event.key.toLowerCase() === 'v') {
        // Without preventDefault, the browser's native paste still fires on
        // xterm's underlying textarea in addition to this handler — pasting
        // everything twice.
        event.preventDefault()
        window.api.readClipboardText().then((text) => {
          if (text) window.api.sendInput(agentId, text)
        })
        return false
      }
      return true
    })

    setTerminal(term)
    setFitAddon(fit)

    return () => {
      term.dispose()
      setTerminal(null)
      setFitAddon(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId])

  usePtyStream(agentId, terminal)
  useTerminalResize(agentId, terminal, fitAddon, containerRef.current, isActive)

  return (
    <div
      data-terminal-surface="true"
      className={`absolute inset-0 h-full w-full p-2 transition-opacity duration-150 ease-[var(--ease-out-quart)] ${
        isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      onMouseDown={() => enterManualTerminalMode(agentId)}
      onContextMenu={(e) => {
        e.preventDefault()
        window.api.readClipboardText().then((text) => {
          if (text) window.api.sendInput(agentId, text)
        })
      }}
    >
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}
