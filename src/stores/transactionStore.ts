import { create } from 'zustand'
import { db } from '@/lib/db'
import type { Transaction, TransactionType } from '@/types'

interface TransactionFilters {
  month?: string        // 'YYYY-MM' prefix
  categoryId?: number
  type?: TransactionType
}

interface TransactionState {
  transactions: Transaction[]
  isLoading: boolean
  error: string | null

  /** Load transactions with optional filters, excludes soft-deleted */
  loadTransactions: (filters?: TransactionFilters) => Promise<void>

  /** Add a new transaction */
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<number>

  /** Update a transaction */
  updateTransaction: (id: number, updates: Partial<Transaction>) => Promise<void>

  /** Soft delete — set deletedAt, returns true if successful */
  softDelete: (id: number) => Promise<boolean>

  /** Undo soft delete — clear deletedAt */
  undoDelete: (id: number) => Promise<void>

  /** Hard delete — permanently remove */
  hardDelete: (id: number) => Promise<void>

  /** Get total spent for a category in a given month */
  getSpentByCategory: (categoryId: number, month: string) => Promise<number>

  /** Get total spent for a month */
  getMonthlyTotal: (month: string) => Promise<number>
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,

  loadTransactions: async (filters) => {
    set({ isLoading: true, error: null })
    try {
      const collection = db.transactions.orderBy('date').reverse()

      const results = await collection.toArray()

      const filtered = results.filter((tx) => {
        if (tx.deletedAt) return false
        if (filters?.month && !tx.date.startsWith(filters.month)) return false
        if (filters?.categoryId && tx.categoryId !== filters.categoryId) return false
        if (filters?.type && tx.type !== filters.type) return false
        return true
      })

      set({ transactions: filtered, isLoading: false })
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false })
    }
  },

  addTransaction: async (tx) => {
    try {
      const id = await db.transactions.add(tx)
      await get().loadTransactions()
      return id ?? -1
    } catch (e) {
      set({ error: (e as Error).message })
      return -1
    }
  },

  updateTransaction: async (id, updates) => {
    try {
      await db.transactions.update(id, updates)
      await get().loadTransactions()
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  softDelete: async (id) => {
    try {
      await db.transactions.update(id, {
        deletedAt: new Date().toISOString(),
      })
      await get().loadTransactions()
      return true
    } catch (e) {
      set({ error: (e as Error).message })
      return false
    }
  },

  undoDelete: async (id) => {
    try {
      await db.transactions.update(id, { deletedAt: null })
      await get().loadTransactions()
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  hardDelete: async (id) => {
    try {
      await db.transactions.delete(id)
      await get().loadTransactions()
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  getSpentByCategory: async (categoryId, month) => {
    const txs = await db.transactions
      .where('date')
      .startsWith(month)
      .and((tx) => tx.categoryId === categoryId && !tx.deletedAt)
      .toArray()
    return txs.reduce((sum, tx) => sum + tx.amount, 0)
  },

  getMonthlyTotal: async (month) => {
    const txs = await db.transactions
      .where('date')
      .startsWith(month)
      .and((tx) => !tx.deletedAt)
      .toArray()
    return txs.reduce((sum, tx) => sum + tx.amount, 0)
  },
}))
