import { useState, useCallback, useMemo } from 'react'
import { useCategoryStore } from '@/stores/categoryStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { getTodayString, getCurrentMonthString, formatVND } from '@/lib/utils'
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

  // Calculate yesterday
  const todayDate = new Date(today + 'T00:00:00+07:00')
  todayDate.setDate(todayDate.getDate() - 1)
  const yesterdayStr = todayDate.toISOString().slice(0, 10)

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

export function useQuickAdd(): UseQuickAddReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [amountDigits, setAmountDigits] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState(getTodayString)
  const [note, setNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [budgetWarning, setBudgetWarning] = useState<BudgetWarning | null>(null)

  const { categories } = useCategoryStore()
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

  // Sort categories: last used first
  const sortedCategories = useMemo(() => {
    const lastUsedId = getLastUsedCategoryId()
    if (!lastUsedId) return categories

    const lastUsed = categories.find((c) => c.id === lastUsedId)
    if (!lastUsed) return categories

    return [lastUsed, ...categories.filter((c) => c.id !== lastUsedId)]
  }, [categories])

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId),
    [categories, selectedCategoryId],
  )

  const canSave = amount > 0 && selectedCategoryId !== null

  const dateLabel = useMemo(() => getDateLabel(selectedDate), [selectedDate])

  // ── Actions ──

  const resetState = useCallback(() => {
    setAmountDigits('')
    setSelectedCategoryId(null)
    setSelectedDate(getTodayString())
    setNote('')
    setBudgetWarning(null)
  }, [])

  const open = useCallback(() => {
    resetState()
    setIsOpen(true)
  }, [resetState])

  const close = useCallback(() => {
    setIsOpen(false)
    resetState()
  }, [resetState])

  const appendDigit = useCallback((digit: number) => {
    setAmountDigits((prev) => {
      const next = prev + String(digit)
      if (next.length > MAX_DIGITS) return prev
      const cleaned = next.replace(/^0+/, '') || ''
      return cleaned
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
      await addTransaction({
        amount: savedAmount,
        categoryId: selectedCategoryId,
        date: selectedDate,
        note: note || undefined,
        type: 'manual',
        createdAt: new Date().toISOString(),
        deletedAt: null,
      })

      setLastUsedCategoryId(selectedCategoryId)
      close()

      return {
        success: true,
        budgetWarningTriggered: false,
        amount: savedAmount,
        categoryName: savedCategoryName,
      }
    } finally {
      setIsSaving(false)
    }
  }, [canSave, selectedCategoryId, amount, selectedCategory, selectedDate, note, addTransaction, close])

  const save = useCallback(async (): Promise<SaveResult> => {
    if (!canSave || !selectedCategoryId || !selectedCategory) return EMPTY_RESULT

    // Check budget limit
    if (selectedCategory.limitPerMonth !== null) {
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
  }, [canSave, selectedCategoryId, selectedCategory, amount, getSpentByCategory, performSave])

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
    isOpen,
    isSaving,
    budgetWarning,
    sortedCategories,
    open,
    close,
    appendDigit,
    deleteDigit,
    clearAmount,
    selectCategory,
    setDate: setSelectedDate,
    setNote,
    save,
    confirmOverBudget,
    dismissBudgetWarning,
    canSave,
    selectedCategory,
    dateLabel,
  }
}
