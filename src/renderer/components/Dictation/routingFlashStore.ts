import { create } from 'zustand'

interface RoutingFlashState {
  flashedAgentId: string | null
  flash: (agentId: string) => void
}

/** Briefly highlights the sidebar tab a dictated utterance was routed to. */
export const useRoutingFlash = create<RoutingFlashState>((set) => ({
  flashedAgentId: null,
  flash: (agentId) => {
    set({ flashedAgentId: agentId })
    setTimeout(() => {
      set((state) => (state.flashedAgentId === agentId ? { flashedAgentId: null } : state))
    }, 1200)
  }
}))
