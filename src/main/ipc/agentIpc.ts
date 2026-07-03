import { ipcMain } from 'electron'
import { agentManager } from '../agents/agentManager'
import { IPC } from '../../shared/ipcChannels'
import type { NewAgentInput } from '../../shared/types'

export function registerAgentIpc(): void {
  ipcMain.handle(IPC.AGENT_LIST, () => agentManager.listAgents())

  ipcMain.handle(IPC.AGENT_CREATE, (_event, input: NewAgentInput) =>
    agentManager.createAgent(input)
  )

  ipcMain.handle(IPC.AGENT_RENAME, (_event, id: string, name: string) =>
    agentManager.renameAgent(id, name)
  )

  ipcMain.handle(IPC.AGENT_SET_ALIASES, (_event, id: string, aliases: string[]) =>
    agentManager.setAliases(id, aliases)
  )

  ipcMain.handle(IPC.AGENT_DELETE, (_event, id: string) => agentManager.deleteAgent(id))

  ipcMain.handle(IPC.AGENT_RESTART, (_event, id: string) => agentManager.restartAgent(id))
}
