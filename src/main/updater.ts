import { app, ipcMain, type BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import { IPC } from '../shared/ipcChannels'

/**
 * Wires electron-updater to GitHub Releases (configured via package.json's
 * build.publish). No-ops entirely in dev — auto-updates only make sense for
 * a packaged, installed build.
 */
function send(window: BrowserWindow, channel: string, payload?: unknown): void {
  if (!window.isDestroyed()) window.webContents.send(channel, payload)
}

export function initUpdater(window: BrowserWindow): void {
  ipcMain.handle(IPC.UPDATE_CHECK, () => checkForUpdates(window))
  ipcMain.on(IPC.UPDATE_INSTALL, () => autoUpdater.quitAndInstall())

  if (!app.isPackaged) return

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-available', (info) => {
    send(window, IPC.UPDATE_AVAILABLE, info.version)
  })
  autoUpdater.on('update-not-available', () => {
    send(window, IPC.UPDATE_NOT_AVAILABLE)
  })
  autoUpdater.on('update-downloaded', (info) => {
    send(window, IPC.UPDATE_DOWNLOADED, info.version)
  })
  autoUpdater.on('error', (err) => {
    send(window, IPC.UPDATE_ERROR, err.message)
  })

  checkForUpdates(window)
}

function checkForUpdates(window: BrowserWindow): void {
  if (!app.isPackaged) {
    send(window, IPC.UPDATE_ERROR, 'Indisponible en mode développement')
    return
  }
  autoUpdater.checkForUpdates().catch((err: Error) => {
    send(window, IPC.UPDATE_ERROR, err.message)
  })
}
