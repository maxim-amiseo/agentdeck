import { create } from 'zustand'
import type { SessionSummary } from '../../shared/types'

interface SessionsState {
  sessions: SessionSummary[]
  loading: boolean
  load: () => Promise<void>
  togglePin: (id: string) => Promise<void>
}

export const useSessionsStore = create<SessionsState>((set, get) => ({
  sessions: [],
  loading: false,

  load: async () => {
    set({ loading: true })
    const sessions = await window.api.listSessions()
    set({ sessions, loading: false })
  },

  togglePin: async (id) => {
    await window.api.toggleSessionPin(id)
    set({ sessions: get().sessions.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s)) })
  }
}))
