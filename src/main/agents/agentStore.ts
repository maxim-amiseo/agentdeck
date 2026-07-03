import Store from 'electron-store'
import { DEFAULT_SETTINGS, type Agent, type Settings } from '../../shared/types'

interface StoreShape {
  agents: Agent[]
  settings: Settings
}

const store = new Store<StoreShape>({
  defaults: {
    agents: [],
    settings: DEFAULT_SETTINGS
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
