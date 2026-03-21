import { create } from 'zustand'
import { db } from '@/lib/db'
import type { FinancialSettings } from '@/types'

interface SettingsState {
  settings: FinancialSettings | null
  isLoading: boolean
  error: string | null

  /** Load settings from DB (single row) */
  loadSettings: () => Promise<void>

  /** Update settings — upsert pattern (create if not exists) */
  updateSettings: (updates: Partial<FinancialSettings>) => Promise<void>

  /** Check if income has been set up (opt-in check) */
  hasIncomeSetup: () => boolean

  /** Check if saving target has been set up */
  hasSavingSetup: () => boolean
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,

  loadSettings: async () => {
    set({ isLoading: true, error: null })
    try {
      const allSettings = await db.settings.toArray()
      set({ settings: allSettings[0] ?? null, isLoading: false })
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false })
    }
  },

  updateSettings: async (updates) => {
    try {
      const current = get().settings
      const updatedAt = new Date().toISOString()

      if (current?.id) {
        await db.settings.update(current.id, { ...updates, updatedAt })
      } else {
        await db.settings.add({
          ...updates,
          updatedAt,
        } as FinancialSettings)
      }

      await get().loadSettings()
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  hasIncomeSetup: () => {
    const { settings } = get()
    return settings?.income != null && settings.income > 0
  },

  hasSavingSetup: () => {
    const { settings } = get()
    return settings?.savingTarget != null && settings.savingTarget > 0
  },
}))
