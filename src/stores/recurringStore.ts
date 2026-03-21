import { create } from 'zustand'
import { db } from '@/lib/db'
import type { RecurringTemplate } from '@/types'

interface RecurringState {
  templates: RecurringTemplate[]
  isLoading: boolean
  error: string | null

  /** Load all recurring templates */
  loadTemplates: () => Promise<void>

  /** Load only active templates */
  loadActiveTemplates: () => Promise<void>

  /** Add a new recurring template */
  addTemplate: (template: Omit<RecurringTemplate, 'id'>) => Promise<void>

  /** Update an existing template */
  updateTemplate: (id: number, updates: Partial<RecurringTemplate>) => Promise<void>

  /** Delete a template */
  deleteTemplate: (id: number) => Promise<void>

  /** Toggle active status */
  toggleActive: (id: number) => Promise<void>
}

export const useRecurringStore = create<RecurringState>((set, get) => ({
  templates: [],
  isLoading: false,
  error: null,

  loadTemplates: async () => {
    set({ isLoading: true, error: null })
    try {
      const templates = await db.recurringTemplates.toArray()
      set({ templates, isLoading: false })
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false })
    }
  },

  loadActiveTemplates: async () => {
    set({ isLoading: true, error: null })
    try {
      const templates = await db.recurringTemplates
        .where('active')
        .equals(1)
        .toArray()
      set({ templates, isLoading: false })
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false })
    }
  },

  addTemplate: async (template) => {
    try {
      await db.recurringTemplates.add(template)
      await get().loadTemplates()
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  updateTemplate: async (id, updates) => {
    try {
      await db.recurringTemplates.update(id, updates)
      await get().loadTemplates()
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  deleteTemplate: async (id) => {
    try {
      await db.recurringTemplates.delete(id)
      await get().loadTemplates()
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  toggleActive: async (id) => {
    try {
      const template = await db.recurringTemplates.get(id)
      if (template) {
        await db.recurringTemplates.update(id, { active: !template.active })
        await get().loadTemplates()
      }
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },
}))
