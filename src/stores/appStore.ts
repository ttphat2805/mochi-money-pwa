import { create } from 'zustand'

interface AppState {
  quickAddOpen: boolean
  quickAddInitialDate: string | null
  quickAddInitialCategoryId: number | null
  openQuickAdd: (date?: string, categoryId?: number) => void
  closeQuickAdd: () => void
}

export const useAppStore = create<AppState>((set) => ({
  quickAddOpen: false,
  quickAddInitialDate: null,
  quickAddInitialCategoryId: null,
  openQuickAdd: (date?: string, categoryId?: number) => set({
    quickAddOpen: true,
    quickAddInitialDate: date ?? null,
    quickAddInitialCategoryId: categoryId ?? null,
  }),
  closeQuickAdd: () => set({
    quickAddOpen: false,
    quickAddInitialDate: null,
    quickAddInitialCategoryId: null,
  }),
}))
