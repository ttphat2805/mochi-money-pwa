export interface PersonalizationSettings {
  appName: string
  accentColor: string
}

const DEFAULT: PersonalizationSettings = {
  appName: 'Chi Tiêu',
  accentColor: '#E8A020',
}

export function getPersonalization(): PersonalizationSettings {
  if (typeof window === 'undefined') return DEFAULT
  try {
    const raw = localStorage.getItem('personalization')
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT
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

  // Derive light bg (Level 1 equivalent)
  root.style.setProperty('--color-accent-bg', color + '18')

  // Set heat map levels via CSS variables for consistency
  root.style.setProperty('--color-accent-h1', color + '18') // ~10%
  root.style.setProperty('--color-accent-h2', color + '35') // ~20%
  root.style.setProperty('--color-accent-h3', color + '70') // ~45%
  root.style.setProperty('--color-accent-h4', color)        // 100%

  // Derive dark: mix with black 30%
  const darken = (c: number) => Math.floor(c * 0.7)
  const darkHex = '#' + [darken(r), darken(g), darken(b)]
    .map(n => n.toString(16).padStart(2, '0')).join('')
  root.style.setProperty('--color-accent-dark', darkHex)
}
