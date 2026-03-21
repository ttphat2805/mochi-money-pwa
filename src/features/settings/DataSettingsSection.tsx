import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { SettingsRow } from './SettingsRow'
import { Divider } from './SettingsHelpers'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { handleExport, importFromJSON, clearAllTransactions } from '@/lib/data-export'

export function DataSettingsSection() {
  const [importing, setImporting] = useState(false)
  const [importConfirmOpen, setImportConfirmOpen] = useState(false)
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.json')) {
      toast.error('Chỉ hỗ trợ file .json')
      return
    }
    setPendingFile(file)
    setImportConfirmOpen(true)
    e.target.value = '' // reset so same file can be re-selected
  }

  const handleImportConfirm = async () => {
    if (!pendingFile) return
    setImporting(true)
    try {
      await importFromJSON(pendingFile)
      toast.success('Đã nhập dữ liệu thành công')
      setTimeout(() => window.location.reload(), 400)
    } catch {
      toast.error('Nhập thất bại · File không hợp lệ')
    } finally {
      setImporting(false)
      setPendingFile(null)
      setImportConfirmOpen(false)
    }
  }

  const handleClearAll = async () => {
    try {
      await clearAllTransactions()
      toast.success('Đã xoá toàn bộ giao dịch')
    } catch {
      toast.error('Xoá thất bại')
    }
  }

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="bg-white mx-4 rounded-xl overflow-hidden border border-border">
        <SettingsRow
          icon="📤"
          label="Xuất dữ liệu"
          sublabel="Lưu backup file .json"
          onTap={() => void handleExport()}
        />
        <Divider />
        <SettingsRow
          icon="📥"
          label="Nhập dữ liệu"
          sublabel="Khôi phục từ file .json"
          onTap={handleImportClick}
        />
        <Divider />
        <SettingsRow
          icon="🗑"
          label="Xoá toàn bộ giao dịch"
          sublabel="Giữ lại danh mục và cài đặt"
          onTap={() => setClearConfirmOpen(true)}
          danger
        />
      </div>

      {/* Import overwrite confirm */}
      <ConfirmDialog
        open={importConfirmOpen}
        onClose={() => { setImportConfirmOpen(false); setPendingFile(null) }}
        onConfirm={handleImportConfirm}
        variant="warning"
        title="Nhập dữ liệu?"
        description="Toàn bộ dữ liệu hiện tại sẽ bị xoá và thay thế bằng file backup."
        confirmLabel={importing ? 'Đang nhập...' : 'Nhập'}
        loading={importing}
      />

      {/* Clear all confirm */}
      <ConfirmDialog
        open={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        onConfirm={handleClearAll}
        variant="delete"
        title="Xoá toàn bộ giao dịch?"
        description="Danh mục và cài đặt sẽ được giữ lại. Không thể hoàn tác."
        confirmLabel="Xoá hết"
      />
    </>
  )
}
