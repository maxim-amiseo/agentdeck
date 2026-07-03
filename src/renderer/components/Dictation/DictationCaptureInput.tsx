import { useEffect, useRef, useState } from 'react'
import { useAgentsStore } from '../../state/agentsStore'
import { useSettingsStore } from '../../state/settingsStore'
import {
  focusCaptureInput,
  registerCaptureInput,
  useFocusArbiter
} from './useFocusArbiter'
import { useRoutingFlash } from './routingFlashStore'
import { parseUtterance } from './dictationRouter'

const MODE_LABEL: Record<string, string> = {
  dictation: 'Écoute',
  'manual-terminal': 'Saisie manuelle',
  chrome: 'En pause'
}

export default function DictationCaptureInput() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const debounceRef = useRef<number | null>(null)

  const [value, setValue] = useState('')
  const valueRef = useRef(value)
  useEffect(() => {
    valueRef.current = value
  }, [value])

  const mode = useFocusArbiter((s) => s.mode)
  const enterDictationMode = useFocusArbiter((s) => s.enterDictationMode)
  const modeRef = useRef(mode)
  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  const agents = useAgentsStore((s) => s.agents)
  const agentsRef = useRef(agents)
  useEffect(() => {
    agentsRef.current = agents
  }, [agents])

  const activeAgentId = useAgentsStore((s) => s.activeAgentId)
  const activeAgentIdRef = useRef(activeAgentId)
  useEffect(() => {
    activeAgentIdRef.current = activeAgentId
  }, [activeAgentId])
  const setActiveAgent = useAgentsStore((s) => s.setActiveAgent)

  const settings = useSettingsStore((s) => s.settings)
  const settingsRef = useRef(settings)
  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  const flash = useRoutingFlash((s) => s.flash)

  const flush = (): void => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    const text = valueRef.current
    setValue('')
    if (!text.trim() || !settingsRef.current.dictationRoutingEnabled) return

    const result = parseUtterance(
      text,
      agentsRef.current,
      activeAgentIdRef.current,
      settingsRef.current.fuzzyMatchThreshold
    )
    if (!result) return

    if (result.targetAgentId !== activeAgentIdRef.current) setActiveAgent(result.targetAgentId)
    if (result.matchedBy !== 'fallback') flash(result.targetAgentId)
    if (result.promptText) window.api.submitPrompt(result.targetAgentId, result.promptText)
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setValue(e.target.value)
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(flush, settingsRef.current.debounceMs)
  }

  // Register the DOM node so the rest of the app (agent creation, terminal
  // clicks, the Escape key, ...) can call focusCaptureInput() to hand focus
  // back without needing a ref to this component.
  useEffect(() => {
    registerCaptureInput(inputRef.current)
    return () => registerCaptureInput(null)
  }, [])

  // Re-acquire focus whenever we're back in "dictation" mode — covers the
  // initial mount, mode transitions back from manual-terminal/chrome, and
  // acts as the entry point for the window-focus/safety-net effects below.
  useEffect(() => {
    if (mode === 'dictation') inputRef.current?.focus()
  }, [mode])

  // Window regained OS focus: Chromium sometimes drops focus to <body> on
  // the round trip. If we were mid-dictation, reclaim it.
  useEffect(() => {
    const unsubFocus = window.api.onWindowFocus(() => {
      if (modeRef.current === 'dictation') focusCaptureInput()
    })
    const unsubBlur = window.api.onWindowBlur(() => {
      flush()
    })
    return () => {
      unsubFocus()
      unsubBlur()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Safety net: if we're supposed to be listening but focus silently
  // drifted to <body>, reclaim it. Cheap poll, not tied to any single event.
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (modeRef.current === 'dictation' && document.activeElement === document.body) {
        focusCaptureInput()
      }
    }, 2000)
    return () => window.clearInterval(interval)
  }, [])

  // Global rule: clicking anything that isn't a terminal surface or another
  // chrome input reverts focus arbitration to dictation mode. Terminal
  // clicks and chrome inputs set their own mode via their own handlers —
  // this only fills in "clicked on empty space" and similar.
  useEffect(() => {
    const onMouseDown = (e: MouseEvent): void => {
      const target = e.target as HTMLElement
      if (target.closest('[data-terminal-surface]')) return
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      if (target.closest('[data-chrome-surface]')) return
      enterDictationMode()
    }
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && modeRef.current !== 'dictation') {
        enterDictationMode()
        focusCaptureInput()
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      data-chrome-surface="true"
      className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-[var(--color-bg)] px-3 py-1.5 ring-1 ring-transparent transition-shadow duration-150 focus-within:ring-[var(--color-accent)]"
    >
      <span
        className={`h-1.5 w-1.5 rounded-full transition-colors duration-200 ${
          mode === 'dictation'
            ? 'animate-pulse-dot bg-[var(--color-status-running)]'
            : 'bg-[var(--color-status-idle)]'
        }`}
      />
      <span className="shrink-0 text-xs text-[var(--color-text-dim)] transition-opacity duration-150">
        {MODE_LABEL[mode]}
        {activeAgentId &&
          agents.find((a) => a.id === activeAgentId) &&
          ` → ${agents.find((a) => a.id === activeAgentId)?.name}`}
      </span>
      <input
        ref={inputRef}
        value={value}
        onChange={onChange}
        onFocus={() => enterDictationMode()}
        onBlur={flush}
        placeholder="La dictée Whisperflow s'accumule ici…"
        className="min-w-0 flex-1 bg-transparent text-sm text-[var(--color-text)] outline-none transition-colors duration-150 placeholder:text-[var(--color-text-dim)]"
      />
    </div>
  )
}
