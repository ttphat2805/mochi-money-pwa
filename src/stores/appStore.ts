import { create } from 'zustand'

interface AppState {
  quickAddOpen: boolean
  quickAddInitialDate: string | null
  quickAddInitialCategoryId: number | null
  dashboardChartMode: 'distribution' | 'trend'
  openQuickAdd: (date?: string, categoryId?: number) => void
  closeQuickAdd: () => void
  setDashboardChartMode: (mode: 'distribution' | 'trend') => void
}

export const useAppStore = create<AppState>((set) => ({
  quickAddOpen: false,
  quickAddInitialDate: null,
  quickAddInitialCategoryId: null,
  dashboardChartMode: 'distribution',
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
  setDashboardChartMode: (mode) => set({ dashboardChartMode: mode }),
}))
