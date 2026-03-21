import { useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { toast } from 'sonner'
import { db } from '@/lib/db'
import { getTodayString } from '@/lib/utils'
import type { RecurringTemplate, RecurringSchedule } from '@/types'

const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

export function scheduleLabel(schedule: RecurringSchedule): string {
  if (schedule === 'daily') return 'Hằng ngày'
  if (schedule === 'weekdays') return 'Thứ 2 – Thứ 6'
  if (Array.isArray(schedule)) return schedule.map((d) => DAY_LABELS[d]).join(', ')
  return ''
}

export function runsToday(schedule: RecurringSchedule): boolean {
  const today = getTodayString()
  const date = new Date(today + 'T00:00:00+07:00')
  const dow = date.getDay()
  if (schedule === 'daily') return true
  if (schedule === 'weekdays') return dow >= 1 && dow <= 5
  if (Array.isArray(schedule)) return schedule.includes(dow)
  return false
}

export function useRecurring() {
  const templates = useLiveQuery(() => db.recurringTemplates.toArray(), []) ?? []

  const addTemplate = useCallback(async (data: Omit<RecurringTemplate, 'id'>) => {
    await db.recurringTemplates.add(data)
    toast.success(`Đã lưu · ${data.name}`)
  }, [])

  const updateTemplate = useCallback(
    async (id: number, updates: Partial<Omit<RecurringTemplate, 'id'>>, name?: string) => {
      await db.recurringTemplates.update(id, updates)
      if (name) toast.success(`Đã lưu · ${name}`)
    },
    [],
  )

  const deleteTemplate = useCallback(async (id: number, name: string) => {
    await db.recurringTemplates.delete(id)
    toast.success(`Đã xoá · ${name}`)
  }, [])

  const toggleActive = useCallback(async (id: number, active: boolean) => {
    await db.recurringTemplates.update(id, { active })
  }, [])

  return { templates, addTemplate, updateTemplate, deleteTemplate, toggleActive }
}
