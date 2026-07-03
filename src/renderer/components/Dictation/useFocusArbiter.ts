import { create } from 'zustand'

export type FocusMode = 'dictation' | 'manual-terminal' | 'chrome'

interface FocusArbiterState {
  mode: FocusMode
  manualTerminalAgentId: string | null
  enterManualTerminalMode: (agentId: string) => void
  enterChromeMode: () => void
  enterDictationMode: () => void
}

/** Safety-net only: if the user clicks into a terminal and never presses
 * Enter or types again, this reclaims dictation focus so a stale manual
 * click can't silently swallow a future dictated utterance forever. The
 * common case (press Enter to confirm/submit) reverts instantly instead,
 * see noteManualTypingActivity below — this timeout is the fallback for
 * everything else, kept short so it's never noticeable in practice. */
const MANUAL_MODE_IDLE_TIMEOUT_MS = 1500

let idleTimer: ReturnType<typeof setTimeout> | null = null

function clearIdleTimer(): void {
  if (idleTimer) {
    clearTimeout(idleTimer)
    idleTimer = null
  }
}

/**
 * Tracks *who owns DOM focus and why*, so the dictation capture input knows
 * when it's safe to steal focus back vs. when the user is deliberately
 * typing somewhere else (a terminal, a settings field).
 */
export const useFocusArbiter = create<FocusArbiterState>((set, get) => ({
  mode: 'dictation',
  manualTerminalAgentId: null,

  enterManualTerminalMode: (agentId) => {
    clearIdleTimer()
    idleTimer = setTimeout(() => {
      if (get().mode === 'manual-terminal' && get().manualTerminalAgentId === agentId) {
        get().enterDictationMode()
        focusCaptureInput()
      }
    }, MANUAL_MODE_IDLE_TIMEOUT_MS)
    set({ mode: 'manual-terminal', manualTerminalAgentId: agentId })
  },

  enterChromeMode: () => {
    clearIdleTimer()
    set({ mode: 'chrome', manualTerminalAgentId: null })
  },

  enterDictationMode: () => {
    clearIdleTimer()
    set({ mode: 'dictation', manualTerminalAgentId: null })
  }
}))

/** Call on every keystroke a terminal forwards to its PTY. Enter/Return
 * (submitting a command, confirming a menu) hands focus back to dictation
 * immediately — zero delay, this is the normal case. Anything else just
 * resets the short safety-net idle timer so active typing isn't cut off. */
export function noteManualTypingActivity(agentId: string, data: string | undefined): void {
  const state = useFocusArbiter.getState()
  if (state.mode !== 'manual-terminal' || state.manualTerminalAgentId !== agentId) return

  if (data && (data.includes('\r') || data.includes('\n'))) {
    state.enterDictationMode()
    focusCaptureInput()
  } else {
    state.enterManualTerminalMode(agentId)
  }
}

let captureInputEl: HTMLInputElement | null = null

export function registerCaptureInput(el: HTMLInputElement | null): void {
  captureInputEl = el
}

export function focusCaptureInput(): void {
  captureInputEl?.focus()
}

export function isCaptureInputFocused(): boolean {
  return document.activeElement === captureInputEl
}
