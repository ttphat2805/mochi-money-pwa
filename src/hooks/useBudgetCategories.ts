import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { db } from '@/lib/db'
import { getCurrentMonthString } from '@/lib/utils'
import { getBudgetStatus, CATEGORY_COLORS, type BudgetStatus } from '@/types'
import { toast } from 'sonner'
import type { BudgetCategory } from '@/types'

export interface CategoryWithBudget extends BudgetCategory {
  spent: number
  status: BudgetStatus
}

export function useBudgetCategories() {
  const monthKey = getCurrentMonthString()

  const rawCategories = useLiveQuery(
    () => db.categories.orderBy('sortOrder').toArray(),
    [],
  ) ?? []

  const categoriesWithBudget = useLiveQuery(async () => {
    const cats = await db.categories.orderBy('sortOrder').toArray()
    const results: CategoryWithBudget[] = []

    for (const cat of cats) {
      if (cat.id == null) {
        results.push({ ...cat, spent: 0, status: 'ok' })
        continue
      }
      const txs = await db.transactions
        .where('date').startsWith(monthKey)
        .filter((tx) => !tx.deletedAt && tx.categoryId === cat.id)
        .toArray()
      const spent = txs.reduce((s, t) => s + t.amount, 0)
      results.push({
        ...cat,
        spent,
        status: getBudgetStatus(spent, cat.limitPerMonth),
      })
    }
    return results
  }, [monthKey]) ?? []

  const warningCategories = useMemo(
    () => categoriesWithBudget.filter((c) => c.status === 'danger' || c.status === 'over'),
    [categoriesWithBudget],
  )

  // ── CRUD ──────────────────────────────────────────────────────

  const addCategory = async (data: Omit<BudgetCategory, 'id' | 'sortOrder' | 'color'>) => {
    const count = await db.categories.count()
    const color = CATEGORY_COLORS[count % CATEGORY_COLORS.length]
    await db.categories.add({ ...data, sortOrder: count, color })
    toast.success(`Đã thêm danh mục · ${data.name}`)
  }

  const updateCategory = async (id: number, data: Partial<BudgetCategory>) => {
    await db.categories.update(id, data)
    toast.success(`Đã lưu · ${data.name ?? ''}`)
  }

  const deleteCategory = async (id: number, name?: string) => {
    await db.categories.delete(id)
    toast.success(`Đã xoá · ${name ?? ''}`)
  }

  const reorderCategories = async (updates: Array<{ id: number; sortOrder: number }>) => {
    await db.transaction('rw', db.categories, async () => {
      for (const { id, sortOrder } of updates) {
        await db.categories.update(id, { sortOrder })
      }
    })
  }

  const getCategoryColor = (index: number) =>
    CATEGORY_COLORS[index % CATEGORY_COLORS.length]

  return {
    categories: rawCategories,
    categoriesWithBudget,
    warningCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    getCategoryColor,
  }
}
