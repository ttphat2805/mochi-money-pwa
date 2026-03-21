import { useState, useCallback, useMemo } from 'react'
import { formatVND } from '@/lib/utils'
import type { RecurringTemplate, RecurringSchedule } from '@/types'

export type SchedulePreset = 'daily' | 'weekdays' | 'custom'

const MAX_DIGITS = 11

interface FormState {
  name: string
  amountDigits: string
  categoryId: number | null
  schedulePreset: SchedulePreset
  customDays: number[]
  active: boolean
}

function defaultState(): FormState {
  return {
    name: '',
    amountDigits: '',
    categoryId: null,
    schedulePreset: 'daily',
    customDays: [1, 2, 3, 4, 5],
    active: true,
  }
}

function templateToState(t: RecurringTemplate): FormState {
  let schedulePreset: SchedulePreset = 'daily'
  let customDays: number[] = [1, 2, 3, 4, 5]

  if (t.schedule === 'daily') schedulePreset = 'daily'
  else if (t.schedule === 'weekdays') schedulePreset = 'weekdays'
  else {
    schedulePreset = 'custom'
    customDays = t.schedule as number[]
  }

  return {
    name: t.name,
    amountDigits: t.amount > 0 ? String(t.amount) : '',
    categoryId: t.categoryId,
    schedulePreset,
    customDays,
    active: t.active,
  }
}

function stateToSchedule(state: FormState): RecurringSchedule {
  if (state.schedulePreset === 'daily') return 'daily'
  if (state.schedulePreset === 'weekdays') return 'weekdays'
  return [...state.customDays].sort((a, b) => a - b)
}

export function useRecurringForm(initial?: RecurringTemplate) {
  const [state, setState] = useState<FormState>(() =>
    initial ? templateToState(initial) : defaultState(),
  )

  const amount = useMemo(() => {
    if (!state.amountDigits) return 0
    return parseInt(state.amountDigits, 10)
  }, [state.amountDigits])

  const amountDisplay = useMemo(() => (amount === 0 ? '0' : formatVND(amount)), [amount])

  const canSave =
    state.name.trim().length > 0 &&
    amount > 0 &&
    state.categoryId !== null &&
    (state.schedulePreset !== 'custom' || state.customDays.length > 0)

  const schedule = useMemo(() => stateToSchedule(state), [state])

  // ── Setters ──

  const setName = useCallback((name: string) => setState((p) => ({ ...p, name })), [])

  const appendDigit = useCallback((digit: number) => {
    setState((prev) => {
      const next = prev.amountDigits + String(digit)
      if (next.length > MAX_DIGITS) return prev
      return { ...prev, amountDigits: next.replace(/^0+/, '') || '' }
    })
  }, [])

  const deleteDigit = useCallback(() => {
    setState((p) => ({ ...p, amountDigits: p.amountDigits.slice(0, -1) }))
  }, [])

  const selectCategory = useCallback((id: number) => {
    setState((p) => ({ ...p, categoryId: p.categoryId === id ? null : id }))
  }, [])

  const setSchedulePreset = useCallback((preset: SchedulePreset) => {
    setState((p) => ({ ...p, schedulePreset: preset }))
  }, [])

  const toggleDay = useCallback((day: number) => {
    setState((p) => {
      const days = p.customDays.includes(day)
        ? p.customDays.filter((d) => d !== day)
        : [...p.customDays, day].sort((a, b) => a - b)
      return { ...p, customDays: days }
    })
  }, [])

  const setActive = useCallback((active: boolean) => setState((p) => ({ ...p, active })), [])

  const reset = useCallback((template?: RecurringTemplate) => {
    setState(template ? templateToState(template) : defaultState())
  }, [])

  return {
    state,
    amount,
    amountDisplay,
    canSave,
    schedule,
    setName,
    appendDigit,
    deleteDigit,
    selectCategory,
    setSchedulePreset,
    toggleDay,
    setActive,
    reset,
  }
}
