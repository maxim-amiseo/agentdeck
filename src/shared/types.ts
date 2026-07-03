export type AgentStatus = 'idle' | 'running' | 'exited'

export interface Agent {
  id: string
  name: string
  aliases: string[]
  cwd: string
  status: AgentStatus
  order: number
  createdAt: number
}

export interface NewAgentInput {
  name: string
  aliases?: string[]
  cwd?: string
}

export interface Settings {
  dictationRoutingEnabled: boolean
  debounceMs: number
  fuzzyMatchThreshold: number
  defaultCwd: string
  claudeExtraArgs: string
}

export const DEFAULT_SETTINGS: Settings = {
  dictationRoutingEnabled: true,
  debounceMs: 900,
  fuzzyMatchThreshold: 2,
  defaultCwd: '',
  claudeExtraArgs: ''
}

export interface PtyDataPayload {
  agentId: string
  chunk: string
}

export interface PtyExitPayload {
  agentId: string
  exitCode: number
}
