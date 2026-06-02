import { create } from 'zustand'

interface AppState {
  quickAddOpen: boolean
  quickAddInitialDate: string | null
  quickAddInitialCategoryId: number | null
  dashboardChartMode: 'distribution' | 'trend'
  calendarSelectedDay: string | null
  openQuickAdd: (date?: string, categoryId?: number) => void
  closeQuickAdd: () => void
  setDashboardChartMode: (mode: 'distribution' | 'trend') => void
  setCalendarSelectedDay: (day: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  quickAddOpen: false,
  quickAddInitialDate: null,
  quickAddInitialCategoryId: null,
  dashboardChartMode: 'distribution',
  calendarSelectedDay: null,
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
  setCalendarSelectedDay: (day) => set({ calendarSelectedDay: day }),
}))
