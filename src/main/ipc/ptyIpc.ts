import { ipcMain } from 'electron'
import { agentManager } from '../agents/agentManager'
import { IPC } from '../../shared/ipcChannels'

export function registerPtyIpc(): void {
  ipcMain.on(IPC.PTY_INPUT, (_event, agentId: string, data: string) => {
    agentManager.writeInput(agentId, data)
  })

  ipcMain.on(IPC.PTY_SUBMIT, (_event, agentId: string, text: string) => {
    agentManager.submitPrompt(agentId, text)
  })

  ipcMain.on(IPC.PTY_RESIZE, (_event, agentId: string, cols: number, rows: number) => {
    agentManager.resize(agentId, cols, rows)
  })

  ipcMain.handle(IPC.PTY_DATA + ':scrollback', (_event, agentId: string) =>
    agentManager.getScrollback(agentId)
  )
}
