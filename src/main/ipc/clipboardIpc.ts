import { ipcMain, clipboard } from 'electron'
import { IPC } from '../../shared/ipcChannels'

export function registerClipboardIpc(): void {
  ipcMain.on(IPC.CLIPBOARD_WRITE_TEXT, (_event, text: string) => {
    clipboard.writeText(text)
  })

  ipcMain.handle(IPC.CLIPBOARD_READ_TEXT, () => clipboard.readText())
}
