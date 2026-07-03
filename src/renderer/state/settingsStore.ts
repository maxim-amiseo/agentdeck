import { create } from 'zustand'
import { DEFAULT_SETTINGS, type Settings } from '../../shared/types'

interface SettingsState {
  settings: Settings
  loaded: boolean
  load: () => Promise<void>
  update: (patch: Partial<Settings>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,

  load: async () => {
    const settings = await window.api.getSettings()
    set({ settings, loaded: true })
  },

  update: async (patch) => {
    const settings = await window.api.setSettings(patch)
    set({ settings })
  }
}))
