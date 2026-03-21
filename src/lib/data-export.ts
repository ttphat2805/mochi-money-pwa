import { toast } from 'sonner'
import { db } from '@/lib/db'
import type {
  BudgetCategory,
  Transaction,
  RecurringTemplate,
  FixedExpense,
  FinancialSettings,
  ExtraIncome,
} from '@/types'

// ── Types ──────────────────────────────────────────────────────

export interface ExportData {
  version: number
  exportedAt: string
  categories: BudgetCategory[]
  transactions: Transaction[]
  recurringTemplates: RecurringTemplate[]
  fixedExpenses: FixedExpense[]
  settings: FinancialSettings | null
  extraIncomes: ExtraIncome[]
}

// ── Export ─────────────────────────────────────────────────────

export async function exportAllData(): Promise<ExportData> {
  const [
    categories,
    transactions,
    recurringTemplates,
    fixedExpenses,
    settingsArr,
    extraIncomes,
  ] = await Promise.all([
    db.categories.toArray(),
    db.transactions.filter((tx) => !tx.deletedAt).toArray(),
    db.recurringTemplates.toArray(),
    db.fixedExpenses.toArray(),
    db.settings.toArray(),
    db.extraIncomes.toArray(),
  ])

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories,
    transactions,
    recurringTemplates,
    fixedExpenses,
    settings: settingsArr[0] ?? null,
    extraIncomes,
  }
}

export function downloadJSON(data: ExportData): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().split('T')[0]
  a.href = url
  a.download = `mochi-backup-${date}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function handleExport(): Promise<void> {
  try {
    const data = await exportAllData()
    downloadJSON(data)
    toast.success(`Đã xuất ${data.transactions.length} giao dịch`)
  } catch {
    toast.error('Xuất dữ liệu thất bại')
  }
}

// ── Import ─────────────────────────────────────────────────────

export async function importFromJSON(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const raw = e.target?.result as string
        const data: ExportData = JSON.parse(raw)

        if (!data.version || !Array.isArray(data.transactions) || !Array.isArray(data.categories)) {
          throw new Error('File không hợp lệ')
        }

        await db.transaction(
          'rw',
          [db.categories, db.transactions, db.recurringTemplates, db.fixedExpenses, db.settings, db.extraIncomes],
          async () => {
            await db.categories.clear()
            await db.transactions.clear()
            await db.recurringTemplates.clear()
            await db.fixedExpenses.clear()
            await db.settings.clear()
            await db.extraIncomes.clear()

            if (data.categories.length) await db.categories.bulkAdd(data.categories)
            if (data.transactions.length) await db.transactions.bulkAdd(data.transactions)
            if (data.recurringTemplates.length) await db.recurringTemplates.bulkAdd(data.recurringTemplates)
            if (data.fixedExpenses.length) await db.fixedExpenses.bulkAdd(data.fixedExpenses)
            if (data.settings) await db.settings.add(data.settings)
            if (data.extraIncomes?.length) await db.extraIncomes.bulkAdd(data.extraIncomes)
          },
        )

        resolve()
      } catch (err) {
        reject(err)
      }
    }

    reader.onerror = () => reject(new Error('Không thể đọc file'))
    reader.readAsText(file)
  })
}

// ── Clear all transactions ─────────────────────────────────────

export async function clearAllTransactions(): Promise<void> {
  await db.transaction(
    'rw',
    [db.transactions, db.recurringTemplates, db.fixedExpenses, db.extraIncomes],
    async () => {
      await Promise.all([
        db.transactions.clear(),
        db.recurringTemplates.clear(),
        db.fixedExpenses.clear(),
        db.extraIncomes.clear(),
        // Intentionally keep: db.categories, db.settings
      ])
    },
  )
}
