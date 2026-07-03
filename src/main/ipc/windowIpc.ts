import { ipcMain, type BrowserWindow } from 'electron'
import { IPC } from '../../shared/ipcChannels'

export function registerWindowIpc(window: BrowserWindow): void {
  ipcMain.on(IPC.WINDOW_MINIMIZE, () => window.minimize())

  ipcMain.on(IPC.WINDOW_TOGGLE_MAXIMIZE, () => {
    if (window.isMaximized()) window.unmaximize()
    else window.maximize()
  })

  ipcMain.on(IPC.WINDOW_CLOSE, () => window.close())

  ipcMain.handle(IPC.WINDOW_IS_MAXIMIZED, () => window.isMaximized())
}
