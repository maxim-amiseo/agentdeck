import Store from 'electron-store'
import { DEFAULT_SETTINGS, type Agent, type Settings } from '../../shared/types'

interface StoreShape {
  agents: Agent[]
  settings: Settings
  pinnedSessionIds: string[]
}

const store = new Store<StoreShape>({
  defaults: {
    agents: [],
    settings: DEFAULT_SETTINGS,
    pinnedSessionIds: []
  }
})

export function loadAgents(): Agent[] {
  return store.get('agents')
}

export function saveAgents(agents: Agent[]): void {
  store.set('agents', agents)
}

export function loadSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...store.get('settings') }
}

export function saveSettings(settings: Settings): void {
  store.set('settings', settings)
}

export function loadPinnedSessionIds(): string[] {
  return store.get('pinnedSessionIds') ?? []
}

export function toggledPinnedSessionId(sessionId: string): string[] {
  const current = new Set(loadPinnedSessionIds())
  if (current.has(sessionId)) current.delete(sessionId)
  else current.add(sessionId)
  const next = Array.from(current)
  store.set('pinnedSessionIds', next)
  return next
}
