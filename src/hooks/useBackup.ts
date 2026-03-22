import { useState } from 'react'
import { toast } from 'sonner'
import {
  exportBackup,
  importBackup,
  restoreBackup,
  clearAllData,
  type BackupData,
  type BackupSummary,
} from '@/lib/backup'

export function useBackup() {
  const [isExporting, setIsExporting] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [importPreviewOpen, setImportPreviewOpen] = useState(false)
  const [importSummary, setImportSummary] = useState<BackupSummary | null>(null)
  const [pendingBackup, setPendingBackup] = useState<BackupData | null>(null)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportBackup()
      toast.success('Đã xuất dữ liệu thành công')
    } catch (err) {
      // Web Share cancelled by user — don't show error toast
      if (err instanceof Error && err.name === 'AbortError') return
      toast.error('Xuất dữ liệu thất bại')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportFile = async (file: File) => {
    const result = await importBackup(file)
    if (!result.success) {
      toast.error(result.error ?? 'Import thất bại')
      return
    }
    setPendingBackup(result.backup!)
    setImportSummary(result.summary!)
    setImportPreviewOpen(true)
  }

  const handleRestore = async (mode: 'replace' | 'merge') => {
    if (!pendingBackup) return
    setIsRestoring(true)
    setImportPreviewOpen(false)
    try {
      await restoreBackup(pendingBackup, mode)
      toast.success(
        mode === 'replace' ? 'Đã khôi phục toàn bộ dữ liệu' : 'Đã gộp dữ liệu thành công',
      )
      setTimeout(() => window.location.reload(), 800)
    } catch {
      toast.error('Khôi phục thất bại')
      setIsRestoring(false)
    } finally {
      setPendingBackup(null)
    }
  }

  const handleClearAll = async () => {
    try {
      await clearAllData()
      toast.success('Đã xoá toàn bộ dữ liệu')
      setTimeout(() => window.location.reload(), 500)
    } catch {
      toast.error('Xoá dữ liệu thất bại')
    }
  }

  return {
    isExporting,
    isRestoring,
    importPreviewOpen,
    setImportPreviewOpen,
    importSummary,
    handleExport,
    handleImportFile,
    handleRestore,
    handleClearAll,
  }
}
