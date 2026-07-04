export type AgentStatus = 'idle' | 'running' | 'exited'

export interface Agent {
  id: string
  name: string
  aliases: string[]
  cwd: string
  status: AgentStatus
  order: number
  createdAt: number
  resumeSessionId?: string
}

export interface NewAgentInput {
  name: string
  aliases?: string[]
  cwd?: string
  resumeSessionId?: string
}

export interface SessionSummary {
  id: string
  cwd: string
  projectLabel: string
  preview: string
  updatedAt: number
  pinned: boolean
}

export interface SessionStats {
  totalSessions: number
  sessionsThisWeek: number
  streakDays: number
  totalSizeMB: number
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
