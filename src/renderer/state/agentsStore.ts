import { create } from 'zustand'
import type { Agent, NewAgentInput } from '../../shared/types'

interface AgentsState {
  agents: Agent[]
  activeAgentId: string | null
  loaded: boolean
  load: () => Promise<void>
  createAgent: (input: NewAgentInput) => Promise<Agent>
  renameAgent: (id: string, name: string) => Promise<void>
  setAliases: (id: string, aliases: string[]) => Promise<void>
  deleteAgent: (id: string) => Promise<void>
  restartAgent: (id: string) => Promise<void>
  setActiveAgent: (id: string) => void
  applyStatus: (agent: Agent) => void
}

export const useAgentsStore = create<AgentsState>((set, get) => ({
  agents: [],
  activeAgentId: null,
  loaded: false,

  load: async () => {
    const agents = await window.api.listAgents()
    set({
      agents,
      loaded: true,
      activeAgentId: get().activeAgentId ?? agents[0]?.id ?? null
    })
  },

  createAgent: async (input) => {
    const agent = await window.api.createAgent(input)
    set((state) => ({ agents: [...state.agents, agent], activeAgentId: agent.id }))
    return agent
  },

  renameAgent: async (id, name) => {
    await window.api.renameAgent(id, name)
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, name } : a))
    }))
  },

  setAliases: async (id, aliases) => {
    await window.api.setAgentAliases(id, aliases)
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, aliases } : a))
    }))
  },

  deleteAgent: async (id) => {
    await window.api.deleteAgent(id)
    set((state) => {
      const remaining = state.agents.filter((a) => a.id !== id)
      const activeAgentId =
        state.activeAgentId === id ? (remaining[0]?.id ?? null) : state.activeAgentId
      return { agents: remaining, activeAgentId }
    })
  },

  restartAgent: async (id) => {
    await window.api.restartAgent(id)
  },

  setActiveAgent: (id) => set({ activeAgentId: id }),

  applyStatus: (agent) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === agent.id ? { ...a, ...agent } : a))
    }))
}))
