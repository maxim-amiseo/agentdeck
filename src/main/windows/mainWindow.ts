import { BrowserWindow, shell } from 'electron'
import { join } from 'node:path'
import { is } from '../util/is'
import { IPC } from '../../shared/ipcChannels'

export function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 560,
    show: false,
    frame: false,
    roundedCorners: true,
    backgroundColor: '#0b0d10',
    icon: join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  window.on('ready-to-show', () => window.show())

  window.on('focus', () => window.webContents.send(IPC.WINDOW_FOCUS))
  window.on('blur', () => window.webContents.send(IPC.WINDOW_BLUR))
  window.on('maximize', () => window.webContents.send(IPC.WINDOW_MAXIMIZED_CHANGED, true))
  window.on('unmaximize', () => window.webContents.send(IPC.WINDOW_MAXIMIZED_CHANGED, false))

  window.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    window.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return window
}
