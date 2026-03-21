import { create } from 'zustand'
import { db } from '@/lib/db'
import type { FixedExpense } from '@/types'

interface FixedExpenseState {
  fixedExpenses: FixedExpense[]
  isLoading: boolean
  error: string | null

  /** Load all fixed expenses */
  loadFixedExpenses: () => Promise<void>

  /** Load only active fixed expenses */
  loadActiveFixedExpenses: () => Promise<void>

  /** Add a new fixed expense */
  addFixedExpense: (expense: Omit<FixedExpense, 'id'>) => Promise<void>

  /** Update an existing fixed expense */
  updateFixedExpense: (id: number, updates: Partial<FixedExpense>) => Promise<void>

  /** Delete a fixed expense */
  deleteFixedExpense: (id: number) => Promise<void>

  /** Toggle active status */
  toggleActive: (id: number) => Promise<void>
}

export const useFixedExpenseStore = create<FixedExpenseState>((set, get) => ({
  fixedExpenses: [],
  isLoading: false,
  error: null,

  loadFixedExpenses: async () => {
    set({ isLoading: true, error: null })
    try {
      const fixedExpenses = await db.fixedExpenses.orderBy('payDay').toArray()
      set({ fixedExpenses, isLoading: false })
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false })
    }
  },

  loadActiveFixedExpenses: async () => {
    set({ isLoading: true, error: null })
    try {
      const fixedExpenses = await db.fixedExpenses
        .where('active')
        .equals(1)
        .toArray()
      set({ fixedExpenses, isLoading: false })
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false })
    }
  },

  addFixedExpense: async (expense) => {
    try {
      await db.fixedExpenses.add(expense)
      await get().loadFixedExpenses()
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  updateFixedExpense: async (id, updates) => {
    try {
      await db.fixedExpenses.update(id, updates)
      await get().loadFixedExpenses()
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  deleteFixedExpense: async (id) => {
    try {
      await db.fixedExpenses.delete(id)
      await get().loadFixedExpenses()
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  toggleActive: async (id) => {
    try {
      const expense = await db.fixedExpenses.get(id)
      if (expense) {
        await db.fixedExpenses.update(id, { active: !expense.active })
        await get().loadFixedExpenses()
      }
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },
}))
