import { create } from 'zustand'
import { db } from '@/lib/db'
import type { BudgetCategory } from '@/types'

export const CATEGORY_COLORS = [
  '#E8A020','#2A9D6E','#D63E3E','#378ADD',
  '#7C3AED','#D97706','#0891B2','#DB2777',
  '#65A30D','#6B7280','#F59E0B','#10B981',
]

interface CategoryState {
  categories: BudgetCategory[]
  isLoading: boolean
  error: string | null

  /** Load all categories from Dexie, ordered by sortOrder */
  loadCategories: () => Promise<void>

  /** Add a new category */
  addCategory: (category: Omit<BudgetCategory, 'id'>) => Promise<number>

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

      // Backfill missing colors
      for (const [i, cat] of unique.entries()) {
        if (!cat.color && cat.id != null) {
          const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length]
          await db.categories.update(cat.id, { color })
          cat.color = color
        }
      }

      set({ categories: unique, isLoading: false })
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false })
    }
  },

  addCategory: async (category) => {
    try {
      const count = await db.categories.count()
      const color = CATEGORY_COLORS[count % CATEGORY_COLORS.length]
      const id = await db.categories.add({ ...category, sortOrder: count, color })
      await get().loadCategories()
      return id as number
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
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
