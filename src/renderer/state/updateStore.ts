import { create } from 'zustand'

type UpdateStatus = 'idle' | 'available' | 'downloaded' | 'error'

interface UpdateState {
  status: UpdateStatus
  version: string | null
  message: string | null
  setAvailable: (version: string) => void
  setDownloaded: (version: string) => void
  setError: (message: string) => void
}

export const useUpdateStore = create<UpdateState>((set) => ({
  status: 'idle',
  version: null,
  message: null,
  setAvailable: (version) => set({ status: 'available', version }),
  setDownloaded: (version) => set({ status: 'downloaded', version }),
  setError: (message) => set({ status: 'error', message })
}))
