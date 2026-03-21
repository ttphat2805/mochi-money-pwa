import { create } from 'zustand'

interface QuickAddStore {
  isOpen: boolean
  open: () => void
  close: () => void
}

/** Global store so BottomNav FAB can open QuickAdd from outside HomePage. */
export const useQuickAddStore = create<QuickAddStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
