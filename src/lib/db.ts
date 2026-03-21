import Dexie, { type EntityTable } from 'dexie'
import type {
  Transaction,
  BudgetCategory,
  RecurringTemplate,
  FixedExpense,
  FinancialSettings,
  ExtraIncome,
} from '@/types'

/**
 * Dexie database instance.
 *
 * Indexes are set once in version 1 and must not be changed lightly.
 * Compound index [date+categoryId] enables fast monthly queries per category.
 */
const db = new Dexie('ChiTieuDB') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>
  categories: EntityTable<BudgetCategory, 'id'>
  recurringTemplates: EntityTable<RecurringTemplate, 'id'>
  fixedExpenses: EntityTable<FixedExpense, 'id'>
  settings: EntityTable<FinancialSettings, 'id'>
  extraIncomes: EntityTable<ExtraIncome, 'id'>
}

db.version(1).stores({
  transactions: '++id, date, categoryId, [date+categoryId], type, deletedAt',
  categories: '++id, sortOrder',
  recurringTemplates: '++id, active',
  fixedExpenses: '++id, payDay, active',
  settings: '++id',
})

// v2: added categoryId to FixedExpense (non-indexed — no store changes needed)
db.version(2).stores({
  transactions: '++id, date, categoryId, [date+categoryId], type, deletedAt',
  categories: '++id, sortOrder',
  recurringTemplates: '++id, active',
  fixedExpenses: '++id, payDay, active',
  settings: '++id',
})

// v3: added extraIncomes table for one-off monthly income sources
db.version(3).stores({
  transactions: '++id, date, categoryId, [date+categoryId], type, deletedAt',
  categories: '++id, sortOrder',
  recurringTemplates: '++id, active',
  fixedExpenses: '++id, payDay, active',
  settings: '++id',
  extraIncomes: '++id, monthKey',
})

export { db }

