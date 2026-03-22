import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { BackButton } from '@/components/BackButton'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatVND, getDaysInMonth, getTodayString, getCurrentMonthString } from '@/lib/utils'
import { useFinancialSettings } from '@/hooks/useFinancialSettings'

interface FinancialSettingsPageProps {
  onBack: () => void
}

// ── VND text input with realtime formatting ─────────────────────

function VNDInput({
  label,
  helper,
  value,
  onChange,
  placeholder = '0',
}: {
  label: string
  helper: string
  value: number
  onChange: (v: number) => void
  placeholder?: string
}) {
  const [raw, setRaw] = useState(value > 0 ? formatVND(value) : '')

  useEffect(() => {
    setRaw(value > 0 ? formatVND(value) : '')
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '')
    const num = parseInt(digits || '0', 10)
    setRaw(digits ? formatVND(num) : '')
    onChange(num)
  }

  const clear = () => {
    setRaw('')
    onChange(0)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-text-hint text-[10px] font-medium uppercase tracking-[1.2px]">
        {label}
      </span>
      <div className="border-border flex items-center rounded-xl border bg-white px-4 py-3 gap-2 focus-within:border-accent transition-colors">
        <input
          inputMode="numeric"
          type="text"
          value={raw}
          onChange={handleChange}
          placeholder={placeholder}
          className="font-num flex-1 text-[20px] bg-transparent outline-none placeholder:text-text-hint"
        />
        {raw ? (
          <button type="button" onClick={clear} className="text-text-hint hover:text-text-muted shrink-0">
            <X className="size-4" />
          </button>
        ) : null}
        <span className="text-text-muted text-[16px] shrink-0">đ</span>
      </div>
      <p className="text-text-hint text-[11px]">{helper}</p>
    </div>
  )
}

// ── Preview card ─────────────────────────────────────────────────

function PreviewCard({
  income,
  saving,
  totalFixed,
  daysInMonth,
}: {
  income: number
  saving: number
  totalFixed: number
  daysInMonth: number
}) {
  const flex = Math.max(0, income - saving - totalFixed)
  const daily = daysInMonth > 0 ? Math.floor(flex / daysInMonth) : 0
  const isOver = income > 0 && income < (saving + totalFixed)

  if (income === 0) return null

  const pctOf = (v: number) => (income > 0 ? Math.round((v / income) * 100) : 0)

  return (
    <div className="rounded-[14px] border border-border bg-white p-4">
      <p className="text-text-muted text-[11px] font-medium uppercase tracking-[1px] mb-3">
        Phân bổ thu nhập
      </p>

      {isOver ? (
        <p className="text-danger text-[13px] font-medium">
          ⚠️ Thu nhập không đủ bù chi phí cố định và tiết kiệm
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <PreviewRow label="Tiết kiệm" amount={saving} pct={pctOf(saving)} color="#3B82F6" />
          <PreviewRow label="Chi phí cố định" amount={totalFixed} pct={pctOf(totalFixed)} color="#8B5CF6" />
          <PreviewRow label="Còn để tiêu" amount={flex} pct={pctOf(flex)} color="#2A9D6E" bold />

          <div className="mt-3 rounded-xl bg-accent-bg px-4 py-3 border border-[#F5D080]">
            <p className="text-text-muted text-[11px]">Mỗi ngày được tiêu</p>
            <p className="font-num text-accent text-[18px] font-semibold mt-0.5">
              ~{formatVND(daily)}đ
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function PreviewRow({
  label,
  amount,
  pct,
  color,
  bold = false,
}: {
  label: string
  amount: number
  pct: number
  color: string
  bold?: boolean
}) {
  return (
    <div className={`flex items-center justify-between text-[13px] ${bold ? 'font-semibold' : ''}`}>
      <div className="flex items-center gap-2">
        <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-text">{label}</span>
      </div>
      <div className="flex items-center gap-2 font-num">
        <span className="text-text-muted">{formatVND(amount)}đ</span>
        <span className="text-text-hint text-[11px] w-8 text-right">{pct}%</span>
      </div>
    </div>
  )
}

// ── Extra income mini-sheet ───────────────────────────────────────

function ExtraIncomeSection({
  extraIncomes,
  onAdd,
  onDelete,
}: {
  extraIncomes: ReturnType<typeof useFinancialSettings>['extraIncomes']
  onAdd: (name: string, amount: number) => void
  onDelete: (id: number) => void
}) {
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-text-hint text-[10px] font-medium uppercase tracking-[1.2px]">
          Thu nhập phụ tháng này
        </span>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1 text-accent text-[12px] font-medium"
        >
          <Plus className="size-3" />
          Thêm
        </button>
      </div>

      {extraIncomes.length > 0 ? (
        <div className="rounded-xl border border-border bg-white divide-y divide-border">
          {extraIncomes.map((ei) => (
            <div key={ei.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-[13px] font-medium">{ei.name}</p>
                {ei.note && <p className="text-text-muted text-[11px]">{ei.note}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-num text-[13px] text-text-muted">+{formatVND(ei.amount)}đ</span>
                <button
                  type="button"
                  onClick={() => ei.id != null && onDelete(ei.id)}
                  className="text-text-hint hover:text-danger transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-text-hint text-[12px]">Freelance, thưởng, bán đồ...</p>
      )}

      {/* Add extra income inline dialog */}
      <ExtraIncomeDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={(name, amount) => {
          onAdd(name, amount)
          setAddOpen(false)
        }}
      />
    </div>
  )
}

function ExtraIncomeDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (name: string, amount: number) => void
}) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState(0)
  const [display, setDisplay] = useState('')

  useEffect(() => {
    if (open) {
      setName('')
      setAmount(0)
      setDisplay('')
    }
  }, [open])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '')
    const num = parseInt(digits || '0', 10)
    setAmount(num)
    setDisplay(num === 0 ? '' : new Intl.NumberFormat('vi-VN').format(num))
  }

  const handleSave = () => {
    if (!name.trim() || amount === 0) return
    onSave(name.trim(), amount)
  }

  const canSave = name.trim().length > 0 && amount > 0

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent
        style={{
          background: '#FFFFFF',
          borderRadius: 20,
          padding: 0,
          maxWidth: 320,
          width: 'calc(100vw - 48px)',
          border: 'none',
          boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px 0',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#1A1A18',
              margin: 0,
            }}>
              Thêm thu nhập phụ
            </h3>
            <p style={{
              fontSize: 12,
              color: '#88887A',
              margin: '3px 0 0',
            }}>
              Thu nhập ngoài lương tháng này
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28,
              borderRadius: '50%',
              background: '#F2F0EC',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginLeft: 8,
            }}
          >
            <X size={14} color="#88887A" />
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '16px 20px' }}>
          {/* Name input */}
          <div style={{ marginBottom: 12 }}>
            <label style={{
              fontSize: 11,
              fontWeight: 500,
              color: '#88887A',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              display: 'block',
              marginBottom: 6,
            }}>
              Tên khoản
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: Freelance tháng 3..."
              autoFocus
              style={{
                width: '100%',
                height: 44,
                borderRadius: 12,
                border: '1.5px solid #E2E0D8',
                background: '#F5F3F0',
                padding: '0 14px',
                fontSize: 16,           // prevents iOS zoom
                color: '#1A1A18',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = '#E8A020'}
              onBlur={e => e.target.style.borderColor = '#E2E0D8'}
            />
          </div>

          {/* Amount input */}
          <div style={{ marginBottom: 4 }}>
            <label style={{
              fontSize: 11,
              fontWeight: 500,
              color: '#88887A',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              display: 'block',
              marginBottom: 6,
            }}>
              Số tiền
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                inputMode="numeric"
                value={display}
                onChange={handleAmountChange}
                placeholder="0"
                style={{
                  width: '100%',
                  height: 52,
                  borderRadius: 12,
                  border: '1.5px solid #E2E0D8',
                  background: amount > 0 ? '#FFF8EE' : '#F5F3F0',
                  padding: '0 40px 0 14px',
                  fontSize: 20,          // large mono font, also prevents zoom
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: amount > 0 ? '#E8A020' : '#B8B8A8',
                  outline: 'none',
                  transition: 'background-color 0.15s, border-color 0.15s',
                  borderColor: amount > 0 ? '#F5D080' : '#E2E0D8',
                }}
                onFocus={e => e.target.style.borderColor = amount > 0 ? '#F5D080' : '#E8A020'}
                onBlur={e => {
                  e.target.style.borderColor = amount > 0 ? '#F5D080' : '#E2E0D8'
                }}
              />
              {/* đ suffix */}
              <span style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 14,
                color: '#B8B8A8',
                pointerEvents: 'none',
              }}>đ</span>
              {/* Clear button */}
              {amount > 0 && (
                <button
                  onClick={() => { setAmount(0); setDisplay('') }}
                  style={{
                    position: 'absolute',
                    right: 36,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 20, height: 20,
                    borderRadius: '50%',
                    background: '#C0BEB4',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={10} color="white" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '0.5px', background: '#F0EDE8' }} />

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          padding: '12px 16px 16px',
          gap: 10,
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 12,
              background: '#F2F0EC',
              border: 'none',
              fontSize: 14,
              fontWeight: 500,
              color: '#88887A',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
            onTouchStart={e => e.currentTarget.style.background = '#E8E6E0'}
            onTouchEnd={e => e.currentTarget.style.background = '#F2F0EC'}
          >
            Huỷ
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              flex: 2,
              height: 44,
              borderRadius: 12,
              background: canSave ? '#E8A020' : '#F2F0EC',
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              color: canSave ? '#fff' : '#C0BEB4',
              cursor: canSave ? 'pointer' : 'default',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            Thêm
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Main page ─────────────────────────────────────────────────────

export function FinancialSettingsPage({ onBack }: FinancialSettingsPageProps) {
  const fin = useFinancialSettings()

  const [income, setIncome] = useState(fin.settings?.income ?? 0)
  const [saving, setSaving] = useState(fin.settings?.savingTarget ?? 0)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Sync with DB values when they load
  useEffect(() => {
    if (fin.settings) {
      setIncome(fin.settings.income ?? 0)
      setSaving(fin.settings.savingTarget ?? 0)
    }
  }, [fin.settings])

  const todayStr = getTodayString()
  const [yr, mo] = todayStr.split('-').map(Number)
  const daysInMonth = getDaysInMonth(yr, mo)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await fin.saveSettings(income, saving)
      onBack()
    } finally {
      setIsSaving(false)
    }
  }

  const handleClear = async () => {
    await fin.clearSettings()
    setIncome(0)
    setSaving(0)
    setClearDialogOpen(false)
  }

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 safe-top">
          <BackButton onBack={onBack} />
          <h1 className="flex-1 text-center text-base font-semibold">Tài chính</h1>
          <div className="size-8" />
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-32">
          <div className="flex flex-col gap-5 px-4 pt-4">
            {/* Section 1 — Income & Saving */}
            <div className="flex flex-col gap-3">
              <span className="text-text-hint text-[10px] font-medium uppercase tracking-[1.2px]">
                Thu nhập & Tiết kiệm
              </span>
              <VNDInput
                label="Thu nhập hằng tháng"
                helper="Lương, thu nhập chính"
                value={income}
                onChange={setIncome}
              />
              <VNDInput
                label="Mục tiêu tiết kiệm / tháng"
                helper="Số tiền cụ thể, không phải %"
                value={saving}
                onChange={setSaving}
              />
            </div>

            {/* Section 2 — Computed preview */}
            <PreviewCard
              income={income}
              saving={saving}
              totalFixed={fin.totalFixed}
              daysInMonth={daysInMonth}
            />

            {/* Section 3 — Extra income */}
            <ExtraIncomeSection
              extraIncomes={fin.extraIncomes}
              onAdd={(name, amount) => {
                const monthKey = getCurrentMonthString()
                void fin.addExtraIncome({ name, amount, monthKey })
              }}
              onDelete={(id) => void fin.deleteExtraIncome(id)}
            />

            {/* Clear link */}
            {fin.isConfigured && (
              <button
                type="button"
                onClick={() => setClearDialogOpen(true)}
                className="self-center text-danger text-[12px]"
              >
                Xoá cài đặt tài chính
              </button>
            )}
          </div>
        </div>

        {/* Save button */}
        <div className="fixed bottom-0 inset-x-0 bg-bg border-t border-border px-4 py-4 safe-bottom">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-text flex h-12 w-full items-center justify-center rounded-[14px] text-white text-[15px] font-semibold disabled:opacity-60 transition-opacity"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
      </div>

      {/* Confirm clear dialog */}
      <Dialog open={clearDialogOpen} onOpenChange={(o) => !o && setClearDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá cài đặt tài chính?</DialogTitle>
            <DialogDescription>
              Màn hình chính sẽ trở về chế độ đơn giản, không hiển thị ngân sách.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setClearDialogOpen(false)}>Huỷ</Button>
            <Button variant="destructive" className="flex-1" onClick={handleClear}>Xoá</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


