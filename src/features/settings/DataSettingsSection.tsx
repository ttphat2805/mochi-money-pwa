import { useState, useRef } from 'react'
import { Download, Trash2, Upload } from 'lucide-react'
import { SettingsRow } from './SettingsRow'
import { Divider } from './SettingsHelpers'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ImportPreviewSheet } from './ImportPreviewSheet'
import { useBackup } from '@/hooks/useBackup'
import { toast } from 'sonner'

export function DataSettingsSection() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)

  const {
    isExporting,
    isRestoring,
    importPreviewOpen,
    setImportPreviewOpen,
    importSummary,
    handleExport,
    handleImportFile,
    handleRestore,
    handleClearAll,
  } = useBackup()

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // reset so same file can be re-selected
    if (!file) return
    if (!file.name.endsWith('.json')) {
      toast.error('Chỉ hỗ trợ file .json')
      return
    }
    void handleImportFile(file)
  }

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="bg-card mx-4 rounded-xl overflow-hidden border border-border">
        <SettingsRow
          icon={<Upload size={18} className="text-text-muted" />}
          label="Xuất dữ liệu (Export)"
          sublabel="Chia sẻ hoặc lưu file backup .json"
          onTap={() => void handleExport()}
          loading={isExporting}
        />
        <Divider />
        <SettingsRow
          icon={<Download size={18} className="text-text-muted" />}
          label="Nhập dữ liệu (Import)"
          sublabel="Khôi phục từ file backup"
          onTap={handleImportClick}
          loading={isRestoring}
        />
        <Divider />
        <SettingsRow
          icon={<Trash2 size={18} className="text-danger" />}
          label="Xoá toàn bộ dữ liệu"
          sublabel="Đặt lại về danh mục mặc định"
          onTap={() => setClearConfirmOpen(true)}
          danger
        />
      </div>

      {/* Import preview sheet — shows summary before restoring */}
      <ImportPreviewSheet
        open={importPreviewOpen}
        summary={importSummary}
        isRestoring={isRestoring}
        onClose={() => setImportPreviewOpen(false)}
        onMerge={() => void handleRestore('merge')}
        onReplace={() => void handleRestore('replace')}
      />

      {/* Clear all confirm */}
      <ConfirmDialog
        open={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        onConfirm={() => { setClearConfirmOpen(false); void handleClearAll() }}
        variant="delete"
        title="Xoá toàn bộ dữ liệu?"
        description="Tất cả giao dịch, danh mục và cài đặt sẽ bị xoá. Danh mục mặc định sẽ được khôi phục."
        confirmLabel="Xoá tất cả"
      />
    </>
  )
}
