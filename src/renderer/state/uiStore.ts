import { create } from 'zustand'

export type ViewMode = 'focus' | 'grid'

export const SIDEBAR_MIN_WIDTH = 180
export const SIDEBAR_MAX_WIDTH = 480
export const SIDEBAR_DEFAULT_WIDTH = 256

function clampSidebarWidth(width: number): number {
  return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width))
}

interface UiState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  sidebarWidth: number
  setSidebarWidth: (width: number) => void

  viewMode: ViewMode
  toggleViewMode: () => void

  historyCollapsed: boolean
  toggleHistory: () => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  sidebarWidth: SIDEBAR_DEFAULT_WIDTH,
  setSidebarWidth: (width) => set({ sidebarWidth: clampSidebarWidth(width) }),

  viewMode: 'focus',
  toggleViewMode: () => set((s) => ({ viewMode: s.viewMode === 'focus' ? 'grid' : 'focus' })),

  historyCollapsed: false,
  toggleHistory: () => set((s) => ({ historyCollapsed: !s.historyCollapsed }))
}))
