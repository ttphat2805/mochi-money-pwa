import { create } from 'zustand'
import { db } from '@/lib/db'
import type { BudgetCategory } from '@/types'

interface CategoryState {
  categories: BudgetCategory[]
  isLoading: boolean
  error: string | null

  /** Load all categories from Dexie, ordered by sortOrder */
  loadCategories: () => Promise<void>

  /** Add a new category */
  addCategory: (category: Omit<BudgetCategory, 'id'>) => Promise<void>

  /** Update an existing category */
  updateCategory: (id: number, updates: Partial<BudgetCategory>) => Promise<void>

  /** Delete a category by id */
  deleteCategory: (id: number) => Promise<void>

  /** Reorder categories by updating sortOrder */
  reorderCategories: (orderedIds: number[]) => Promise<void>
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  loadCategories: async () => {
    set({ isLoading: true, error: null })
    try {
      const raw = await db.categories.orderBy('sortOrder').toArray()

      // Safety net: deduplicate by name — StrictMode race can seed twice,
      // creating same-name categories with different IDs. Keep lowest ID, delete rest.
      const seenNames = new Map<string, number>() // name → kept id
      const unique: typeof raw = []
      const dupeIds: number[] = []

      for (const cat of raw) {
        if (!seenNames.has(cat.name)) {
          seenNames.set(cat.name, cat.id ?? 0)
          unique.push(cat)
        } else if (cat.id != null) {
          dupeIds.push(cat.id)
        }
      }

      // Silently clean up duplicates from DB
      if (dupeIds.length > 0) {
        await db.categories.bulkDelete(dupeIds)
      }

      set({ categories: unique, isLoading: false })
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false })
    }
  },

  addCategory: async (category) => {
    try {
      await db.categories.add(category)
      await get().loadCategories()
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  updateCategory: async (id, updates) => {
    try {
      await db.categories.update(id, updates)
      await get().loadCategories()
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  deleteCategory: async (id) => {
    try {
      await db.categories.delete(id)
      await get().loadCategories()
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  reorderCategories: async (orderedIds) => {
    try {
      await db.transaction('rw', db.categories, async () => {
        for (let i = 0; i < orderedIds.length; i++) {
          await db.categories.update(orderedIds[i], { sortOrder: i })
        }
      })
      await get().loadCategories()
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },
}))
