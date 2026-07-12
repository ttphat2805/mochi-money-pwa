export interface PersonalizationSettings {
  appName: string
  accentColor: string
}

/** Old light-theme default accent — migrated to the new green on read */
const LEGACY_DEFAULT_ACCENT = '#E8A020'

const DEFAULT: PersonalizationSettings = {
  appName: 'Chi Tiêu',
  accentColor: '#059669',
}

export function getPersonalization(): PersonalizationSettings {
  if (typeof window === 'undefined') return DEFAULT
  try {
    const raw = localStorage.getItem('personalization')
    const settings: PersonalizationSettings = raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT
    // Users who never picked a custom accent carry the old amber default —
    // move them onto the new theme default
    if (settings.accentColor?.toUpperCase() === LEGACY_DEFAULT_ACCENT) {
      settings.accentColor = DEFAULT.accentColor
    }
    return settings
  } catch {
    return DEFAULT
  }
}

export function savePersonalization(data: Partial<PersonalizationSettings>) {
  if (typeof window === 'undefined') return
  const current = getPersonalization()
  localStorage.setItem('personalization', JSON.stringify({ ...current, ...data }))
}

export function applyAccentColor(color: string) {
  if (typeof window === 'undefined') return
  const root = document.documentElement

  // Parse hex to RGB for rgba() usage
  const cleanHex = color.replace('#', '')
  const r = parseInt(cleanHex.slice(0, 2), 16)
  const g = parseInt(cleanHex.slice(2, 4), 16)
  const b = parseInt(cleanHex.slice(4, 6), 16)

  root.style.setProperty('--color-accent', color)
  root.style.setProperty('--color-accent-rgb', `${r}, ${g}, ${b}`)

  // Derive subtle bg tint (Level 1 equivalent)
  root.style.setProperty('--color-accent-bg', color + '18')

  // Set heat map levels via CSS variables for consistency
  root.style.setProperty('--color-accent-h1', color + '18') // ~10%
  root.style.setProperty('--color-accent-h2', color + '35') // ~20%
  root.style.setProperty('--color-accent-h3', color + '70') // ~45%
  root.style.setProperty('--color-accent-h4', color)        // 100%

  // --color-accent-dark is accent-toned TEXT on the dark theme, so it must
  // be a LIGHTER tint of the accent (mix with white) to keep contrast
  const lighten = (c: number) => Math.min(255, Math.floor(c + (255 - c) * 0.45))
  const lightHex = '#' + [lighten(r), lighten(g), lighten(b)]
    .map(n => n.toString(16).padStart(2, '0')).join('')
  root.style.setProperty('--color-accent-dark', lightHex)
}
