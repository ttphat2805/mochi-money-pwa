import { useState, useCallback, useMemo, useEffect } from 'react'
import { useTransactionStore } from '@/stores/transactionStore'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useAppStore } from '@/stores/appStore'
import { getTodayString, getCurrentMonthString, formatVND, getDateNDaysAgo } from '@/lib/utils'
import type { BudgetCategory } from '@/types'

const LAST_USED_CATEGORY_KEY = 'chitieu_last_category_id'
const MAX_DIGITS = 11 // 99.999.999.999

interface BudgetWarning {
  category: BudgetCategory
  currentSpent: number
  limit: number
  newAmount: number
}

/** Returned from save to allow the caller to show a toast */
interface SaveResult {
  success: boolean
  /** If true, budget warning was triggered instead of saving */
  budgetWarningTriggered: boolean
  amount: number
  categoryName: string
  isFirst?: boolean
}

interface UseQuickAddReturn {
  // State
  amount: number
  amountDisplay: string
  selectedCategoryId: number | null
  selectedDate: string
  note: string
  isOpen: boolean
  isSaving: boolean
  budgetWarning: BudgetWarning | null
  isNote: boolean

  // Sorted categories (last used first)
  sortedCategories: BudgetCategory[]

  // Actions
  open: () => void
  close: () => void
  appendDigit: (digit: number) => void
  deleteDigit: () => void
  clearAmount: () => void
  selectCategory: (id: number) => void
  setDate: (date: string) => void
  setNote: (note: string) => void
  toggleIsNote: () => void
  addAmount: (value: number) => void
  save: () => Promise<SaveResult>
  confirmOverBudget: () => Promise<SaveResult>
  dismissBudgetWarning: () => void

  // Computed
  canSave: boolean
  selectedCategory: BudgetCategory | undefined
  dateLabel: string
}

function getDateLabel(dateStr: string): string {
  const today = getTodayString()

  if (dateStr === today) {
    return 'Hôm nay'
  }

  const yesterdayStr = getDateNDaysAgo(1)

  if (dateStr === yesterdayStr) {
    return 'Hôm qua'
  }

  // Format as DD/MM/YYYY
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

function getLastUsedCategoryId(): number | null {
  const stored = localStorage.getItem(LAST_USED_CATEGORY_KEY)
  if (!stored) return null
  const parsed = parseInt(stored, 10)
  return isNaN(parsed) ? null : parsed
}

function setLastUsedCategoryId(id: number): void {
  localStorage.setItem(LAST_USED_CATEGORY_KEY, String(id))
}

const EMPTY_RESULT: SaveResult = {
  success: false,
  budgetWarningTriggered: false,
  amount: 0,
  categoryName: '',
}

const EMPTY_CATS: BudgetCategory[] = []

export function useQuickAdd(): UseQuickAddReturn {
  const { quickAddOpen, closeQuickAdd, quickAddInitialDate, quickAddInitialCategoryId } = useAppStore()
  const [amountDigits, setAmountDigits] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState(getTodayString)
  const [note, setNote] = useState('')
  const [isNote, setIsNote] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [budgetWarning, setBudgetWarning] = useState<BudgetWarning | null>(null)

  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? EMPTY_CATS
  const { addTransaction, getSpentByCategory } = useTransactionStore()

  // Derived amount from digit string
  const amount = useMemo(() => {
    if (amountDigits === '') return 0
    return parseInt(amountDigits, 10)
  }, [amountDigits])

  const amountDisplay = useMemo(() => {
    if (amount === 0) return '0'
    return formatVND(amount)
  }, [amount])

  // Sort categories by sortOrder, then by id
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const orderA = a.sortOrder ?? 0;
      const orderB = b.sortOrder ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return (a.id ?? 0) - (b.id ?? 0);
    });
  }, [categories]);

  // Select first category by default if none selected
  useEffect(() => {
    if (selectedCategoryId === null && sortedCategories.length > 0) {
      setSelectedCategoryId(sortedCategories[0].id ?? null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedCategories])

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId),
    [categories, selectedCategoryId],
  )

  const canSave = amount > 0 && selectedCategoryId !== null

  const dateLabel = useMemo(() => getDateLabel(selectedDate), [selectedDate])

  // ── Actions ──

  const resetState = useCallback((date?: string | null, categoryId?: number | null) => {
    const lastUsedId = getLastUsedCategoryId()
    const validUsedId = lastUsedId && categories.find(c => c.id === lastUsedId) 
      ? lastUsedId 
      : categories.length > 0 ? categories[0].id! : null

    const finalCategoryId = categoryId ?? validUsedId

    setAmountDigits('')
    setSelectedCategoryId(finalCategoryId)
    setSelectedDate(date ? date : getTodayString())
    setNote('')
    setIsNote(false)
    setBudgetWarning(null)
  }, [categories])

  const open = useCallback(() => {
    resetState()
    useAppStore.getState().openQuickAdd()
  }, [resetState])

  const close = closeQuickAdd

  // Reset state when the sheet opens (with initial context) or closes (delayed to avoid flash)
  useEffect(() => {
    if (quickAddOpen) {
      resetState(quickAddInitialDate, quickAddInitialCategoryId)
    } else {
      const t = setTimeout(() => resetState(), 400)
      return () => clearTimeout(t)
    }
    // intentionally omit resetState/initialDate to avoid re-runs mid-session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickAddOpen])

  const appendDigit = useCallback((digit: number) => {
    setAmountDigits((prev) => {
      if (prev === '0' && digit !== 0) return String(digit)
      if (prev === '0' && digit === 0) return prev
      if (prev === '' && digit === 0) return '0'
      const next = prev + String(digit)
      if (next.length > MAX_DIGITS) return prev
      return next
    })
  }, [])

  const deleteDigit = useCallback(() => {
    setAmountDigits((prev) => prev.slice(0, -1))
  }, [])

  const clearAmount = useCallback(() => {
    setAmountDigits('')
  }, [])

  const selectCategory = useCallback((id: number) => {
    setSelectedCategoryId((prev) => (prev === id ? null : id))
  }, [])

  const toggleIsNote = useCallback(() => {
    setIsNote((prev) => !prev)
  }, [])

  const addAmount = useCallback((value: number) => {
    setAmountDigits((prev) => {
      const current = prev === '' ? 0 : parseInt(prev, 10)
      const next = current + value
      const nextStr = String(next)
      if (nextStr.length > MAX_DIGITS) return prev
      return nextStr
    })
  }, [])

  /**
   * Core save logic — captures values BEFORE resetting state.
   * Returns result so caller can show toast with the correct data.
   */
  const performSave = useCallback(async (): Promise<SaveResult> => {
    if (!canSave || !selectedCategoryId) return EMPTY_RESULT

    // Capture values before close() resets them
    const savedAmount = amount
    const savedCategoryName = selectedCategory?.name ?? ''

    setIsSaving(true)
    try {
      const txCount = await db.transactions.count()
      const isFirst = txCount === 0

      await addTransaction({
        amount: savedAmount,
        categoryId: selectedCategoryId,
        date: selectedDate,
        note: note || undefined,
        type: 'manual',
        createdAt: new Date().toISOString(),
        deletedAt: null,
        isNote: isNote || undefined,
      })

      setLastUsedCategoryId(selectedCategoryId)
      close()

      return {
        success: true,
        budgetWarningTriggered: false,
        amount: savedAmount,
        categoryName: savedCategoryName,
        isFirst,
      }
    } finally {
      setIsSaving(false)
    }
  }, [canSave, selectedCategoryId, amount, selectedCategory, selectedDate, note, isNote, addTransaction, close])

  const save = useCallback(async (): Promise<SaveResult> => {
    if (!canSave || !selectedCategoryId || !selectedCategory) return EMPTY_RESULT

    // Skip budget check for note-only transactions (they don't affect spending)
    if (!isNote && selectedCategory.limitPerMonth !== null) {
      const month = getCurrentMonthString()
      const currentSpent = await getSpentByCategory(selectedCategoryId, month)

      if (currentSpent + amount > selectedCategory.limitPerMonth) {
        setBudgetWarning({
          category: selectedCategory,
          currentSpent,
          limit: selectedCategory.limitPerMonth,
          newAmount: amount,
        })
        return {
          success: false,
          budgetWarningTriggered: true,
          amount,
          categoryName: selectedCategory.name,
        }
      }
    }

    return performSave()
  }, [canSave, selectedCategoryId, selectedCategory, isNote, amount, getSpentByCategory, performSave])

  const confirmOverBudget = useCallback(async (): Promise<SaveResult> => {
    setBudgetWarning(null)
    return performSave()
  }, [performSave])

  const dismissBudgetWarning = useCallback(() => {
    setBudgetWarning(null)
  }, [])

  return {
    amount,
    amountDisplay,
    selectedCategoryId,
    selectedDate,
    note,
    isOpen: quickAddOpen,
    isSaving,
    budgetWarning,
    isNote,
    sortedCategories,
    open,
    close,
    appendDigit,
    deleteDigit,
    clearAmount,
    selectCategory,
    setDate: setSelectedDate,
    setNote,
    toggleIsNote,
    addAmount,
    save,
    confirmOverBudget,
    dismissBudgetWarning,
    canSave,
    selectedCategory,
    dateLabel,
  }
}
