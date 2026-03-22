import { useState } from 'react'
import { getPersonalization, savePersonalization, applyAccentColor } from '@/lib/personalization'

export function usePersonalization() {
  const [settings, setSettings] = useState(getPersonalization)

  const updateAppName = (name: string) => {
    const trimmed = name.trim() || 'Chi Tiêu'
    savePersonalization({ appName: trimmed })
    setSettings(prev => ({ ...prev, appName: trimmed }))
  }

  const updateAccentColor = (color: string) => {
    savePersonalization({ accentColor: color })
    setSettings(prev => ({ ...prev, accentColor: color }))
    applyAccentColor(color) // apply immediately, no reload needed
  }

  return { settings, updateAppName, updateAccentColor }
}
