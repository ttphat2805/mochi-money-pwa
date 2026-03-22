import { useMemo } from 'react'
import { RefreshCw, Settings } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { toast } from 'sonner'
import { db } from '@/lib/db'
import { getTodayString, formatVND, getVietnameseDay } from '@/lib/utils'
import { useAppStore } from '@/stores/appStore'
import { RecurringRow } from '@/features/home/RecurringRow'
import type { RecurringItem } from '@/hooks/useHomeData'
import type { RecurringTemplate, BudgetCategory } from '@/types'

// ── Timezone-safe runsToday ────────────────────────────────────

function runsToday(schedule: RecurringTemplate['schedule']): boolean {
  const vnDay = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })
  ).getDay()
  if (schedule === 'daily') return true
  if (schedule === 'weekdays') return vnDay >= 1 && vnDay <= 5
  if (Array.isArray(schedule)) return schedule.includes(vnDay)
  return false
}

// ── TodayPage ─────────────────────────────────────────────────

interface TodayPageProps {
  onSettings: () => void
}

export function TodayPage({ onSettings }: TodayPageProps) {
  const today = getTodayString()
  const dayLabel = getVietnameseDay()
  const { openQuickAdd } = useAppStore()

  // ── Live queries ──
  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? []
  const activeTemplates = useLiveQuery(
    () => db.recurringTemplates.filter((t) => t.active).toArray(),
    []
  ) ?? []
  const todayTxs = useLiveQuery(
    () => db.transactions.where('date').equals(today).filter((tx) => !tx.deletedAt).toArray(),
    [today]
  ) ?? []

  // ── Derived ──
  const catMap = useMemo(() => {
    const m = new Map<number, BudgetCategory>()
    for (const c of categories) { if (c.id != null) m.set(c.id, c) }
    return m
  }, [categories])

  const todayRecurringMap = useMemo(() => {
    const m = new Map<number, number>() // recurringId → transactionId
    for (const tx of todayTxs) {
      if (tx.type === 'recurring' && tx.recurringId != null && tx.id != null) {
        m.set(tx.recurringId, tx.id)
      }
    }
    return m
  }, [todayTxs])

  const recurringItems = useMemo<RecurringItem[]>(() => {
    return activeTemplates
      .filter((t) => runsToday(t.schedule))
      .map((t) => ({
        template: t,
        category: t.categoryId ? catMap.get(t.categoryId) : undefined,
        isDone: t.id != null ? todayRecurringMap.has(t.id) : false,
        transactionId: t.id != null ? todayRecurringMap.get(t.id) : undefined,
      }))
  }, [activeTemplates, catMap, todayRecurringMap])

  const confirmedCount = recurringItems.filter((i) => i.isDone).length
  const totalCount = recurringItems.length
  const totalToday = todayTxs.reduce((s, tx) => s + tx.amount, 0)
  const savingToday = 0 // placeholder — no income context in this screen

  // ── Toggle recurring ──
  const toggleRecurring = async (item: RecurringItem) => {
    const { template, isDone, transactionId } = item

    if (isDone) {
      if (transactionId != null) {
        await db.transactions.update(transactionId, { deletedAt: new Date().toISOString() })
        toast.success(`Đã hoàn ${formatVND(template.amount)}đ · ${item.category?.name ?? ''}`)
      }
      return
    }

    await db.transactions.add({
      amount: template.amount,
      categoryId: template.categoryId,
      date: today,
      type: 'recurring',
      recurringId: template.id,
      createdAt: new Date().toISOString(),
      deletedAt: null,
    })
    navigator.vibrate?.(10)
    toast.success(`Đã ghi −${formatVND(template.amount)}đ · ${item.category?.name ?? ''}`)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="safe-top px-5 pt-3 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight">Hôm nay</h1>
            <p className="text-text-muted text-[13px] mt-0.5 capitalize">{dayLabel}</p>
          </div>
          <button
            type="button"
            onClick={onSettings}
            className="bg-surface active:bg-surface2 flex size-8 items-center justify-center rounded-full transition-colors mt-1"
            aria-label="Cài đặt"
          >
            <Settings className="size-4 text-text-muted" />
          </button>
        </div>

        {/* Summary strip */}
        {recurringItems.length > 0 && (
          <div
            className="mt-3 flex gap-3 rounded-2xl px-4 py-3"
            style={{ background: 'linear-gradient(135deg, #FFF8EC 0%, #FFF4DC 100%)' }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-text-hint uppercase tracking-[1px]">Đã xác nhận</p>
              <p className="text-[15px] font-semibold mt-0.5">
                {confirmedCount}/{totalCount}
              </p>
            </div>
            <div className="w-px bg-[#F5D080]" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-text-hint uppercase tracking-[1px]">Tổng hôm nay</p>
              <p className="text-[13px] font-semibold text-accent mt-0.5">
                {totalToday > 0 ? `−${formatVND(totalToday)}đ` : '—'}
              </p>
            </div>
            {savingToday > 0 && (
              <>
                <div className="w-px bg-[#F5D080]" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium text-text-hint uppercase tracking-[1px]">Tiết kiệm</p>
                  <p className="text-[13px] font-semibold text-success mt-0.5">+{formatVND(savingToday)}đ</p>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-6">
        {/* Section label */}
        <div className="px-5 pb-1.5 pt-3">
          <span className="text-text-hint text-[10px] font-medium uppercase tracking-[1.2px]">
            Khoản lặp lại hôm nay
          </span>
        </div>

        {/* Recurring items */}
        {recurringItems.length === 0 ? (
          <div className="mx-4 rounded-2xl bg-surface px-5 py-8 flex flex-col items-center gap-3 text-center">
            <span className="text-4xl leading-none">🔁</span>
            <div>
              <p className="text-[14px] font-semibold text-text">Chưa có khoản lặp lại</p>
              <p className="text-text-muted text-[12px] mt-1">Thêm trong Cài đặt để app tự nhắc hằng ngày</p>
            </div>
            <button
              type="button"
              onClick={onSettings}
              className="mt-1 h-9 px-5 rounded-full bg-text text-white text-[13px] font-medium flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Settings size={13} />
              Vào Cài đặt
            </button>
          </div>
        ) : (
          <div className="mx-2 flex flex-col">
            {recurringItems.map((item) => (
              <RecurringRow
                key={item.template.id}
                item={item}
                onToggle={() => toggleRecurring(item)}
              />
            ))}
          </div>
        )}

        {/* Add today button */}
        <div className="mx-4 mt-4">
          <button
            type="button"
            onClick={() => {
              openQuickAdd(today)
            }}
            className="w-full h-12 rounded-2xl bg-surface text-[14px] font-medium text-text-muted flex items-center justify-center gap-2 transition-all active:bg-surface2 active:scale-[0.98] border border-dashed border-border2"
          >
            <RefreshCw size={16} />
            + Thêm chi tiêu hôm nay
          </button>
        </div>
      </div>

    </div>
  )
}
