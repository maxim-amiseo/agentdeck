import { app, ipcMain, type BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import { IPC } from '../shared/ipcChannels'

/**
 * Wires electron-updater to GitHub Releases (configured via package.json's
 * build.publish). No-ops entirely in dev — auto-updates only make sense for
 * a packaged, installed build.
 */
export function initUpdater(window: BrowserWindow): void {
  ipcMain.handle(IPC.UPDATE_CHECK, () => checkForUpdates(window))
  ipcMain.on(IPC.UPDATE_INSTALL, () => autoUpdater.quitAndInstall())

  if (!app.isPackaged) return

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-available', (info) => {
    window.webContents.send(IPC.UPDATE_AVAILABLE, info.version)
  })
  autoUpdater.on('update-not-available', () => {
    window.webContents.send(IPC.UPDATE_NOT_AVAILABLE)
  })
  autoUpdater.on('update-downloaded', (info) => {
    window.webContents.send(IPC.UPDATE_DOWNLOADED, info.version)
  })
  autoUpdater.on('error', (err) => {
    window.webContents.send(IPC.UPDATE_ERROR, err.message)
  })

  checkForUpdates(window)
}

function checkForUpdates(window: BrowserWindow): void {
  if (!app.isPackaged) {
    window.webContents.send(IPC.UPDATE_ERROR, 'Indisponible en mode développement')
    return
  }
  autoUpdater.checkForUpdates().catch((err: Error) => {
    window.webContents.send(IPC.UPDATE_ERROR, err.message)
  })
}
