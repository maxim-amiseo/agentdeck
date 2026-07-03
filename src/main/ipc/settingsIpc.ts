import { ipcMain } from 'electron'
import { agentManager } from '../agents/agentManager'
import { IPC } from '../../shared/ipcChannels'
import type { Settings } from '../../shared/types'

export function registerSettingsIpc(): void {
  ipcMain.handle(IPC.SETTINGS_GET, () => agentManager.getSettings())

  ipcMain.handle(IPC.SETTINGS_SET, (_event, patch: Partial<Settings>) =>
    agentManager.setSettings(patch)
  )
}
