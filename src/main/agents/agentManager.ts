import { BrowserWindow } from 'electron'
import { randomUUID } from 'node:crypto'
import { PtyProcess } from './ptyProcess'
import { loadAgents, saveAgents, loadSettings, saveSettings } from './agentStore'
import { IPC } from '../../shared/ipcChannels'
import type { Agent, NewAgentInput, Settings } from '../../shared/types'

class AgentManager {
  private agents = new Map<string, Agent>()
  private ptys = new Map<string, PtyProcess>()
  private settings: Settings
  private window: BrowserWindow | null = null

  constructor() {
    this.settings = loadSettings()
  }

  attachWindow(window: BrowserWindow): void {
    this.window = window
  }

  private send(channel: string, payload: unknown): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send(channel, payload)
    }
  }

  /** Recreates a PTY for every agent saved from a previous session. */
  bootstrap(): void {
    for (const agent of loadAgents()) {
      this.agents.set(agent.id, agent)
      this.spawnPty(agent)
    }
  }

  private persistAgents(): void {
    saveAgents(Array.from(this.agents.values()))
  }

  private spawnPty(agent: Agent): void {
    const proc = new PtyProcess(agent, this.settings)
    this.ptys.set(agent.id, proc)
    this.updateStatus(agent.id, 'running')

    proc.onData((chunk) => {
      this.send(IPC.PTY_DATA, { agentId: agent.id, chunk })
    })

    proc.onExit((exitCode) => {
      this.updateStatus(agent.id, 'exited')
      this.send(IPC.PTY_EXIT, { agentId: agent.id, exitCode })
    })
  }

  private updateStatus(agentId: string, status: Agent['status']): void {
    const agent = this.agents.get(agentId)
    if (!agent) return
    agent.status = status
    this.send(IPC.AGENT_STATUS_CHANGED, agent)
  }

  listAgents(): Agent[] {
    return Array.from(this.agents.values()).sort((a, b) => a.order - b.order)
  }

  createAgent(input: NewAgentInput): Agent {
    const name = input.name.trim()
    if (!name) throw new Error('Agent name is required')
    const collides = Array.from(this.agents.values()).some(
      (a) => a.name.toLowerCase() === name.toLowerCase()
    )
    if (collides) throw new Error(`Un agent nommé "${name}" existe déjà`)

    const agent: Agent = {
      id: randomUUID(),
      name,
      aliases: input.aliases ?? [],
      cwd: input.cwd || this.settings.defaultCwd,
      status: 'idle',
      order: this.agents.size,
      createdAt: Date.now(),
      resumeSessionId: input.resumeSessionId
    }
    this.agents.set(agent.id, agent)
    this.persistAgents()
    this.spawnPty(agent)
    return agent
  }

  renameAgent(id: string, name: string): void {
    const agent = this.agents.get(id)
    if (!agent) return
    agent.name = name.trim()
    this.persistAgents()
  }

  setAliases(id: string, aliases: string[]): void {
    const agent = this.agents.get(id)
    if (!agent) return
    agent.aliases = aliases
    this.persistAgents()
  }

  deleteAgent(id: string): void {
    this.ptys.get(id)?.kill()
    this.ptys.delete(id)
    this.agents.delete(id)
    this.persistAgents()
  }

  restartAgent(id: string): void {
    const agent = this.agents.get(id)
    if (!agent) return
    this.ptys.get(id)?.kill()
    this.ptys.delete(id)
    this.spawnPty(agent)
  }

  writeInput(id: string, data: string): void {
    this.ptys.get(id)?.write(data)
  }

  submitPrompt(id: string, text: string): void {
    this.ptys.get(id)?.submitPrompt(text)
  }

  resize(id: string, cols: number, rows: number): void {
    this.ptys.get(id)?.resize(cols, rows)
  }

  getScrollback(id: string): string {
    return this.ptys.get(id)?.getScrollback() ?? ''
  }

  getSettings(): Settings {
    return this.settings
  }

  setSettings(patch: Partial<Settings>): Settings {
    this.settings = { ...this.settings, ...patch }
    saveSettings(this.settings)
    return this.settings
  }

  killAll(): void {
    for (const proc of this.ptys.values()) proc.kill()
  }
}

export const agentManager = new AgentManager()
