import { create } from 'zustand'

interface AppState {
  quickAddOpen: boolean
  quickAddInitialDate: string | null
  openQuickAdd: (date?: string) => void
  closeQuickAdd: () => void
}

export const useAppStore = create<AppState>((set) => ({
  quickAddOpen: false,
  quickAddInitialDate: null,
  openQuickAdd: (date?: string) => set({
    quickAddOpen: true,
    quickAddInitialDate: date ?? null,
  }),
  closeQuickAdd: () => set({
    quickAddOpen: false,
    quickAddInitialDate: null,
  }),
}))
