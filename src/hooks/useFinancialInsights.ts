import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { getCurrentMonthString } from '@/lib/utils'
import { useCategoryStore } from '@/stores/categoryStore'

function getPrevMonthKey(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number)
  if (m === 1) return `${y - 1}-12`
  return `${y}-${String(m - 1).padStart(2, '0')}`
}

export interface FinancialInsight {
  type: 'positive' | 'negative' | 'neutral'
  title: string
  message: string
  icon: string
  diff?: number
  diffPct?: number
  impactCategory?: string
}

export function useFinancialInsights() {
  const currentMonthKey = getCurrentMonthString()
  const prevMonthKey = getPrevMonthKey(currentMonthKey)
  const { categories } = useCategoryStore()

  // Get current and previous month transactions in parallel
  const data = useLiveQuery(async () => {
    const [currentTxs, prevTxs] = await Promise.all([
      db.transactions
        .where('date')
        .between(currentMonthKey + '-01', currentMonthKey + '-32', true, false)
        .filter((tx) => !tx.deletedAt)
        .toArray(),
      db.transactions
        .where('date')
        .between(prevMonthKey + '-01', prevMonthKey + '-32', true, false)
        .filter((tx) => !tx.deletedAt)
        .toArray()
    ])

    return { currentTxs, prevTxs }
  }, [currentMonthKey, prevMonthKey])

  const insights = useMemo(() => {
    if (!data) return null
    const { currentTxs, prevTxs } = data

    const currentTotal = currentTxs.reduce((s, t) => s + t.amount, 0)
    const prevTotal = prevTxs.reduce((s, t) => s + t.amount, 0)

    // Category breakdown
    const currentCats = new Map<number, number>()
    currentTxs.forEach(t => currentCats.set(t.categoryId, (currentCats.get(t.categoryId) ?? 0) + t.amount))
    
    const prevCats = new Map<number, number>()
    prevTxs.forEach(t => prevCats.set(t.categoryId, (prevCats.get(t.categoryId) ?? 0) + t.amount))

    const list: FinancialInsight[] = []

    // 1. Overall comparison
    if (prevTotal > 0) {
      const diff = currentTotal - prevTotal
      const diffPct = Math.round((diff / prevTotal) * 100)

      if (diff < 0) {
        list.push({
          type: 'positive',
          title: 'Chi tiêu giảm',
          message: `Thật tuyệt! Bạn đã chi tiêu ít hơn tháng trước ${Math.abs(diffPct)}%.`,
          icon: '💰',
          diff,
          diffPct
        })
      } else if (diffPct > 15) {
        list.push({
          type: 'negative',
          title: 'Chi tiêu tăng cao',
          message: `Tháng này bạn đang chi tiêu nhiều hơn ${diffPct}% so với tháng trước.`,
          icon: '⚠️',
          diff,
          diffPct
        })
      }
    }

    // 2. Category level insight (find biggest change)
    let biggestIncrease = { name: '', diff: 0, pct: 0 }
    categories.forEach(cat => {
      const c = currentCats.get(cat.id!) ?? 0
      const p = prevCats.get(cat.id!) ?? 0
      if (p > 0) {
        const d = c - p
        const pct = Math.round((d / p) * 100)
        if (pct > biggestIncrease.pct) {
          biggestIncrease = { name: cat.name, diff: d, pct }
        }
      }
    })

    if (biggestIncrease.pct >= 20) {
       list.push({
         type: 'negative',
         title: 'Cần chú ý',
         message: `Chi tiêu cho "${biggestIncrease.name}" đã tăng ${biggestIncrease.pct}% so với tháng trước.`,
         icon: '🔍',
         impactCategory: biggestIncrease.name
       })
    }

    // 3. Welcome insight if first time or no data
    if (prevTotal === 0 && currentTotal > 0) {
      list.push({
        type: 'neutral',
        title: 'Bắt đầu hành trình',
        message: 'Tôi sẽ phân tích thói quen chi tiêu của bạn sau khi bạn có dữ liệu từ 2 tháng trở lên.',
        icon: '🚀'
      })
    }

    return list
  }, [data, categories])

  return { insights, isLoading: !data }
}
