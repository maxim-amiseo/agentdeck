import { ipcMain } from 'electron'
import { IPC } from '../../shared/ipcChannels'
import { listSessions, computeSessionStats } from '../sessions/sessionIndex'
import { toggledPinnedSessionId } from '../agents/agentStore'

export function registerSessionsIpc(): void {
  ipcMain.handle(IPC.SESSIONS_LIST, () => listSessions())

  ipcMain.handle(IPC.SESSIONS_TOGGLE_PIN, (_event, sessionId: string) =>
    toggledPinnedSessionId(sessionId)
  )

  ipcMain.handle(IPC.SESSIONS_STATS, () => computeSessionStats())
}
