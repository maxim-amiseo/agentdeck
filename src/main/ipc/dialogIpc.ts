import { ipcMain, dialog, type BrowserWindow } from 'electron'
import { IPC } from '../../shared/ipcChannels'

export function registerDialogIpc(window: BrowserWindow): void {
  ipcMain.handle(IPC.DIALOG_PICK_DIRECTORY, async () => {
    const result = await dialog.showOpenDialog(window, { properties: ['openDirectory'] })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })
}
