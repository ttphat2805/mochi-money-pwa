import { useState, useEffect } from 'react'
import { ArrowLeft, X, Plus, Trash2 } from 'lucide-react'
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
  const [name, setName] = useState('')
  const [rawAmount, setRawAmount] = useState('')

  const amount = parseInt(rawAmount.replace(/\D/g, '') || '0', 10)

  const handleAdd = () => {
    if (!name.trim() || amount === 0) return
    onAdd(name.trim(), amount)
    setName('')
    setRawAmount('')
    setAddOpen(false)
  }

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
      <Dialog open={addOpen} onOpenChange={(o) => !o && setAddOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm thu nhập phụ</DialogTitle>
            <DialogDescription>Thu nhập ngoài lương tháng này</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Freelance tháng 3..."
              className="border-border rounded-xl border px-4 py-3 text-[14px] outline-none focus:border-accent transition-colors"
            />
            <div className="border-border flex items-center rounded-xl border px-4 py-3 gap-2 focus-within:border-accent transition-colors">
              <input
                inputMode="numeric"
                type="text"
                value={rawAmount ? formatVND(parseInt(rawAmount.replace(/\D/g, '') || '0', 10)) : ''}
                onChange={(e) => setRawAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="Số tiền"
                className="font-num flex-1 text-[18px] bg-transparent outline-none placeholder:text-text-hint"
              />
              <span className="text-text-muted shrink-0">đ</span>
            </div>
          </div>
          <DialogFooter className="flex-row gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setAddOpen(false)}>Huỷ</Button>
            <Button className="flex-1 bg-accent text-white" onClick={handleAdd} disabled={!name.trim() || amount === 0}>
              Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
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
          <button
            type="button"
            onClick={onBack}
            className="bg-surface active:bg-surface2 flex size-8 items-center justify-center rounded-full transition-colors"
            aria-label="Quay lại"
          >
            <ArrowLeft className="size-4" />
          </button>
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


