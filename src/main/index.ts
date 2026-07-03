import { app, BrowserWindow } from 'electron'
import { createMainWindow } from './windows/mainWindow'
import { agentManager } from './agents/agentManager'
import { registerAgentIpc } from './ipc/agentIpc'
import { registerPtyIpc } from './ipc/ptyIpc'
import { registerSettingsIpc } from './ipc/settingsIpc'
import { registerWindowIpc } from './ipc/windowIpc'
import { registerDialogIpc } from './ipc/dialogIpc'
import { registerClipboardIpc } from './ipc/clipboardIpc'
import { registerSessionsIpc } from './ipc/sessionsIpc'
import { initUpdater } from './updater'

app.whenReady().then(() => {
  registerAgentIpc()
  registerPtyIpc()
  registerSettingsIpc()
  registerClipboardIpc()
  registerSessionsIpc()

  const window = createMainWindow()
  agentManager.attachWindow(window)
  agentManager.bootstrap()
  registerWindowIpc(window)
  registerDialogIpc(window)
  initUpdater(window)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const win = createMainWindow()
      agentManager.attachWindow(win)
    }
  })
})

app.on('window-all-closed', () => {
  agentManager.killAll()
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  agentManager.killAll()
})
