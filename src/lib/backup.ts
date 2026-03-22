import { getTodayString } from '@/lib/utils'
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

export interface BackupData {
  version: number
  exportedAt: string
  appVersion: string
  data: {
    categories: BudgetCategory[]
    transactions: Transaction[]
    recurringTemplates: RecurringTemplate[]
    fixedExpenses: FixedExpense[]
    settings: FinancialSettings[]
    extraIncomes: ExtraIncome[]
  }
}

export interface BackupSummary {
  exportedAt: string
  transactionCount: number
  categoryCount: number
  recurringCount: number
  monthRange: string
}

export interface ImportResult {
  success: boolean
  error?: string
  backup?: BackupData
  summary?: BackupSummary
}

// ── Build backup object ────────────────────────────────────────

async function buildBackupData(): Promise<BackupData> {
  const [
    categories,
    transactions,
    recurringTemplates,
    fixedExpenses,
    settings,
    extraIncomes,
  ] = await Promise.all([
    db.categories.toArray(),
    db.transactions.toArray(),
    db.recurringTemplates.toArray(),
    db.fixedExpenses.toArray(),
    db.settings.toArray(),
    db.extraIncomes.toArray(),
  ])

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    appVersion: '1.0.0',
    data: {
      categories,
      transactions,
      recurringTemplates,
      fixedExpenses,
      settings,
      extraIncomes,
    },
  }
}

// ── Export ─────────────────────────────────────────────────────

export async function exportBackup(): Promise<void> {
  const backup = await buildBackupData()
  const json = JSON.stringify(backup, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const date = getTodayString()
  const filename = `mochi-backup-${date}.json`

  // iOS PWA: use Web Share API to share as file (shows native share sheet)
  if (navigator.share && navigator.canShare) {
    const file = new File([blob], filename, { type: 'application/json' })
    if (navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'Mochi Backup',
        text: `Backup dữ liệu chi tiêu ${date}`,
        files: [file],
      })
      return
    }
  }

  // Fallback: standard download link
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Validate ───────────────────────────────────────────────────

function validateBackup(backup: unknown): { valid: boolean; error?: string } {
  if (!backup || typeof backup !== 'object') {
    return { valid: false, error: 'Định dạng file không đúng' }
  }

  const b = backup as Partial<BackupData>

  if (b.version !== 1) {
    return { valid: false, error: 'Phiên bản backup không tương thích' }
  }

  if (!b.data || !Array.isArray(b.data.transactions) || !Array.isArray(b.data.categories)) {
    return { valid: false, error: 'Dữ liệu backup không đầy đủ' }
  }

  return { valid: true }
}

// ── Summary ────────────────────────────────────────────────────

function getMonthRange(transactions: Transaction[]): string {
  const active = transactions.filter((t) => !t.deletedAt).map((t) => t.date).sort()
  if (!active.length) return 'Không có giao dịch'
  const first = active[0].slice(0, 7)
  const last = active[active.length - 1].slice(0, 7)
  if (first === last) return `Tháng ${parseInt(first.split('-')[1])}`
  const [, fm] = first.split('-')
  const [, lm] = last.split('-')
  return `T${parseInt(fm)} → T${parseInt(lm)}`
}

function getBackupSummary(backup: BackupData): BackupSummary {
  return {
    exportedAt: backup.exportedAt,
    transactionCount: backup.data.transactions.filter((t) => !t.deletedAt).length,
    categoryCount: backup.data.categories.length,
    recurringCount: backup.data.recurringTemplates.length,
    monthRange: getMonthRange(backup.data.transactions),
  }
}

// ── Import — parse file only, don't write yet ──────────────────

export async function importBackup(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const json = e.target?.result as string
        const backup = JSON.parse(json) as BackupData

        const validation = validateBackup(backup)
        if (!validation.valid) {
          resolve({ success: false, error: validation.error })
          return
        }

        resolve({
          success: true,
          backup,
          summary: getBackupSummary(backup),
        })
      } catch {
        resolve({ success: false, error: 'File không hợp lệ hoặc bị hỏng' })
      }
    }

    reader.onerror = () => resolve({ success: false, error: 'Không thể đọc file' })
    reader.readAsText(file)
  })
}

// ── Restore — write to Dexie ───────────────────────────────────

export async function restoreBackup(
  backup: BackupData,
  mode: 'replace' | 'merge',
): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.categories,
      db.transactions,
      db.recurringTemplates,
      db.fixedExpenses,
      db.settings,
      db.extraIncomes,
    ],
    async () => {
      if (mode === 'replace') {
        await Promise.all([
          db.categories.clear(),
          db.transactions.clear(),
          db.recurringTemplates.clear(),
          db.fixedExpenses.clear(),
          db.settings.clear(),
          db.extraIncomes.clear(),
        ])
      }

      // bulkPut handles duplicates gracefully in merge mode
      await Promise.all([
        db.categories.bulkPut(backup.data.categories),
        db.transactions.bulkPut(backup.data.transactions),
        db.recurringTemplates.bulkPut(backup.data.recurringTemplates),
        db.fixedExpenses.bulkPut(backup.data.fixedExpenses),
        db.settings.bulkPut(backup.data.settings),
        backup.data.extraIncomes.length
          ? db.extraIncomes.bulkPut(backup.data.extraIncomes)
          : Promise.resolve([]),
      ])
    },
  )
}

// ── Clear all + reseed ─────────────────────────────────────────

export async function clearAllData(): Promise<void> {
  const { seedDefaultCategories } = await import('@/lib/seed')
  await db.transaction(
    'rw',
    [
      db.categories,
      db.transactions,
      db.recurringTemplates,
      db.fixedExpenses,
      db.settings,
      db.extraIncomes,
    ],
    async () => {
      await Promise.all([
        db.categories.clear(),
        db.transactions.clear(),
        db.recurringTemplates.clear(),
        db.fixedExpenses.clear(),
        db.settings.clear(),
        db.extraIncomes.clear(),
      ])
    },
  )
  // Re-seed after transaction so categories table is empty
  await seedDefaultCategories()
}
