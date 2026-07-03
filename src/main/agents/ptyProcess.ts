import * as pty from 'node-pty'
import { CLAUDE_BIN, buildClaudeArgs } from './claudeLaunchArgs'
import type { Agent, Settings } from '../../shared/types'

const SCROLLBACK_LIMIT = 5000

export class PtyProcess {
  readonly agentId: string
  private ptyHandle: pty.IPty
  private scrollback: string[] = []
  private onDataCallbacks = new Set<(chunk: string) => void>()
  private onExitCallbacks = new Set<(exitCode: number) => void>()

  constructor(agent: Agent, settings: Settings) {
    this.agentId = agent.id
    this.ptyHandle = this.spawn(agent, settings)
  }

  private spawn(agent: Agent, settings: Settings): pty.IPty {
    const handle = pty.spawn(CLAUDE_BIN, buildClaudeArgs(agent, settings), {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: agent.cwd || process.env.USERPROFILE || process.cwd(),
      env: process.env as Record<string, string>
    })

    handle.onData((chunk) => {
      this.scrollback.push(chunk)
      if (this.scrollback.length > SCROLLBACK_LIMIT) this.scrollback.shift()
      for (const cb of this.onDataCallbacks) cb(chunk)
    })

    handle.onExit(({ exitCode }) => {
      for (const cb of this.onExitCallbacks) cb(exitCode)
    })

    return handle
  }

  getScrollback(): string {
    return this.scrollback.join('')
  }

  write(data: string): void {
    this.ptyHandle.write(data)
  }

  submitPrompt(text: string): void {
    // Writing text and '\r' in one chunk gets swallowed by Claude Code's CLI
    // input (it looks like a multi-line paste, which doesn't auto-submit).
    // Writing them as two separate chunks mimics "type, then press Enter".
    this.ptyHandle.write(text)
    setTimeout(() => this.ptyHandle.write('\r'), 80)
  }

  resize(cols: number, rows: number): void {
    if (cols <= 0 || rows <= 0) return
    this.ptyHandle.resize(cols, rows)
  }

  kill(): void {
    this.ptyHandle.kill()
  }

  onData(cb: (chunk: string) => void): () => void {
    this.onDataCallbacks.add(cb)
    return () => this.onDataCallbacks.delete(cb)
  }

  onExit(cb: (exitCode: number) => void): () => void {
    this.onExitCallbacks.add(cb)
    return () => this.onExitCallbacks.delete(cb)
  }
}
