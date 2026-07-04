import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/ipcChannels'
import type {
  Agent,
  NewAgentInput,
  PtyDataPayload,
  PtyExitPayload,
  Settings,
  SessionSummary,
  SessionStats
} from '../shared/types'

const api = {
  listAgents: (): Promise<Agent[]> => ipcRenderer.invoke(IPC.AGENT_LIST),
  createAgent: (input: NewAgentInput): Promise<Agent> => ipcRenderer.invoke(IPC.AGENT_CREATE, input),
  renameAgent: (id: string, name: string): Promise<void> =>
    ipcRenderer.invoke(IPC.AGENT_RENAME, id, name),
  setAgentAliases: (id: string, aliases: string[]): Promise<void> =>
    ipcRenderer.invoke(IPC.AGENT_SET_ALIASES, id, aliases),
  deleteAgent: (id: string): Promise<void> => ipcRenderer.invoke(IPC.AGENT_DELETE, id),
  restartAgent: (id: string): Promise<void> => ipcRenderer.invoke(IPC.AGENT_RESTART, id),

  sendInput: (agentId: string, data: string): void => {
    ipcRenderer.send(IPC.PTY_INPUT, agentId, data)
  },
  submitPrompt: (agentId: string, text: string): void => {
    ipcRenderer.send(IPC.PTY_SUBMIT, agentId, text)
  },
  resizePty: (agentId: string, cols: number, rows: number): void => {
    ipcRenderer.send(IPC.PTY_RESIZE, agentId, cols, rows)
  },
  getScrollback: (agentId: string): Promise<string> =>
    ipcRenderer.invoke(IPC.PTY_DATA + ':scrollback', agentId),

  onPtyData: (cb: (payload: PtyDataPayload) => void): (() => void) => {
    const listener = (_e: Electron.IpcRendererEvent, payload: PtyDataPayload): void => cb(payload)
    ipcRenderer.on(IPC.PTY_DATA, listener)
    return () => ipcRenderer.removeListener(IPC.PTY_DATA, listener)
  },
  onPtyExit: (cb: (payload: PtyExitPayload) => void): (() => void) => {
    const listener = (_e: Electron.IpcRendererEvent, payload: PtyExitPayload): void => cb(payload)
    ipcRenderer.on(IPC.PTY_EXIT, listener)
    return () => ipcRenderer.removeListener(IPC.PTY_EXIT, listener)
  },
  onAgentStatusChanged: (cb: (agent: Agent) => void): (() => void) => {
    const listener = (_e: Electron.IpcRendererEvent, agent: Agent): void => cb(agent)
    ipcRenderer.on(IPC.AGENT_STATUS_CHANGED, listener)
    return () => ipcRenderer.removeListener(IPC.AGENT_STATUS_CHANGED, listener)
  },

  getSettings: (): Promise<Settings> => ipcRenderer.invoke(IPC.SETTINGS_GET),
  setSettings: (patch: Partial<Settings>): Promise<Settings> =>
    ipcRenderer.invoke(IPC.SETTINGS_SET, patch),

  onWindowFocus: (cb: () => void): (() => void) => {
    const listener = (): void => cb()
    ipcRenderer.on(IPC.WINDOW_FOCUS, listener)
    return () => ipcRenderer.removeListener(IPC.WINDOW_FOCUS, listener)
  },
  onWindowBlur: (cb: () => void): (() => void) => {
    const listener = (): void => cb()
    ipcRenderer.on(IPC.WINDOW_BLUR, listener)
    return () => ipcRenderer.removeListener(IPC.WINDOW_BLUR, listener)
  },

  minimizeWindow: (): void => ipcRenderer.send(IPC.WINDOW_MINIMIZE),
  toggleMaximizeWindow: (): void => ipcRenderer.send(IPC.WINDOW_TOGGLE_MAXIMIZE),
  closeWindow: (): void => ipcRenderer.send(IPC.WINDOW_CLOSE),
  isWindowMaximized: (): Promise<boolean> => ipcRenderer.invoke(IPC.WINDOW_IS_MAXIMIZED),
  onWindowMaximizedChanged: (cb: (maximized: boolean) => void): (() => void) => {
    const listener = (_e: Electron.IpcRendererEvent, maximized: boolean): void => cb(maximized)
    ipcRenderer.on(IPC.WINDOW_MAXIMIZED_CHANGED, listener)
    return () => ipcRenderer.removeListener(IPC.WINDOW_MAXIMIZED_CHANGED, listener)
  },

  pickDirectory: (): Promise<string | null> => ipcRenderer.invoke(IPC.DIALOG_PICK_DIRECTORY),

  copyToClipboard: (text: string): void => ipcRenderer.send(IPC.CLIPBOARD_WRITE_TEXT, text),
  readClipboardText: (): Promise<string> => ipcRenderer.invoke(IPC.CLIPBOARD_READ_TEXT),

  checkForUpdates: (): Promise<void> => ipcRenderer.invoke(IPC.UPDATE_CHECK),
  installUpdate: (): void => ipcRenderer.send(IPC.UPDATE_INSTALL),
  onUpdateAvailable: (cb: (version: string) => void): (() => void) => {
    const listener = (_e: Electron.IpcRendererEvent, version: string): void => cb(version)
    ipcRenderer.on(IPC.UPDATE_AVAILABLE, listener)
    return () => ipcRenderer.removeListener(IPC.UPDATE_AVAILABLE, listener)
  },
  onUpdateNotAvailable: (cb: () => void): (() => void) => {
    const listener = (): void => cb()
    ipcRenderer.on(IPC.UPDATE_NOT_AVAILABLE, listener)
    return () => ipcRenderer.removeListener(IPC.UPDATE_NOT_AVAILABLE, listener)
  },
  onUpdateDownloaded: (cb: (version: string) => void): (() => void) => {
    const listener = (_e: Electron.IpcRendererEvent, version: string): void => cb(version)
    ipcRenderer.on(IPC.UPDATE_DOWNLOADED, listener)
    return () => ipcRenderer.removeListener(IPC.UPDATE_DOWNLOADED, listener)
  },
  onUpdateError: (cb: (message: string) => void): (() => void) => {
    const listener = (_e: Electron.IpcRendererEvent, message: string): void => cb(message)
    ipcRenderer.on(IPC.UPDATE_ERROR, listener)
    return () => ipcRenderer.removeListener(IPC.UPDATE_ERROR, listener)
  },

  listSessions: (): Promise<SessionSummary[]> => ipcRenderer.invoke(IPC.SESSIONS_LIST),
  toggleSessionPin: (sessionId: string): Promise<string[]> =>
    ipcRenderer.invoke(IPC.SESSIONS_TOGGLE_PIN, sessionId),
  getSessionStats: (): Promise<SessionStats> => ipcRenderer.invoke(IPC.SESSIONS_STATS)
}

contextBridge.exposeInMainWorld('api', api)

export type AgentDeckApi = typeof api
