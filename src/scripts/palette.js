// Theme: colour palette + light/dark mode (2.4.0; palettes since 2.3.0).
// The CSS lives in styles/palette.css and styles/dark.css; index.html applies
// the saved theme before first paint. localStorage keys (Quasar encoding):
//   palette     __q_strn|blue|teal|green|plum
//   themeMode   __q_strn|light|dark|auto   (index.html writes the starting
//               value once: auto for a new visitor, light for an existing one)
//   themeChosen __q_bool|1 once the visitor has confirmed a theme (hides the
//               Theme card on Today)
// Light: white text on color and color on white are both >= 4.5:1.
// Dark: "dark" is the brand colour on dark surfaces (>= 7.9:1 on #1e1e1e, and
// #121212 text on it >= 8.9:1); "bar" is the header/footer (white >= 9.4:1).
import storage from './storage'

export const PALETTES = [
  { id: 'blue', nameKey: 'paletteBlue', color: '#2471a3', dark: '#7dbbe6', bar: '#1c4a6a' },
  { id: 'teal', nameKey: 'paletteTeal', color: '#1f6f6b', dark: '#6cc7bf', bar: '#174e4b' },
  { id: 'green', nameKey: 'paletteGreen', color: '#3d6b45', dark: '#93c79b', bar: '#2c4d32' },
  { id: 'plum', nameKey: 'palettePlum', color: '#7a4a7d', dark: '#d4a3d6', bar: '#583659' }
]

export const MODES = [
  { id: 'light', nameKey: 'themeModeLight' },
  { id: 'dark', nameKey: 'themeModeDark' },
  { id: 'auto', nameKey: 'themeModeAuto' }
]

export const DEFAULT_PALETTE = 'blue'
export const DEFAULT_MODE = 'auto'

const darkQuery = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-color-scheme: dark)')
  : null

export function paletteById(id) {
  return PALETTES.find(function (p) { return p.id === id }) || PALETTES[0]
}

export function currentPaletteId() {
  return paletteById(storage.get('palette', DEFAULT_PALETTE)).id
}

export function currentMode() {
  const id = storage.get('themeMode', DEFAULT_MODE)
  return MODES.some(function (m) { return m.id === id }) ? id : DEFAULT_MODE
}

export function systemPrefersDark() {
  return !!(darkQuery && darkQuery.matches)
}

// 'light' or 'dark' for a stored mode (Auto follows the system setting).
export function effectiveMode(mode) {
  const m = mode || currentMode()
  if (m === 'auto') return systemPrefersDark() ? 'dark' : 'light'
  return m
}

export function themeChosen() {
  return storage.get('themeChosen', false) === true
}

export function setThemeChosen() {
  storage.set('themeChosen', true)
  window.dispatchEvent(new CustomEvent('themechosen'))
}

function setMeta(color) {
  let meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', color)
}

// Puts the stored (or given) palette and mode on <html> and tells listeners.
export function applyTheme(paletteId, mode) {
  const palette = paletteById(paletteId || currentPaletteId())
  const pref = mode || currentMode()
  const eff = effectiveMode(pref)
  const html = document.documentElement
  const changed = html.getAttribute('data-palette') !== palette.id || html.getAttribute('data-mode') !== eff
  html.setAttribute('data-palette', palette.id)
  html.setAttribute('data-mode', eff)
  html.setAttribute('data-mode-pref', pref)
  html.style.colorScheme = eff
  html.style.backgroundColor = eff === 'dark' ? '#121212' : ''
  setMeta(eff === 'dark' ? palette.bar : palette.color)
  if (changed) {
    window.dispatchEvent(new CustomEvent('themechange', { detail: { palette: palette.id, mode: eff, pref: pref } }))
  }
  return palette
}

// Kept for 2.3.0 callers.
export function applyPalette(id) {
  return applyTheme(id)
}

export function setPalette(id) {
  const palette = paletteById(id)
  storage.set('palette', palette.id)
  return applyTheme(palette.id)
}

export function setMode(id) {
  const mode = MODES.some(function (m) { return m.id === id }) ? id : DEFAULT_MODE
  storage.set('themeMode', mode)
  applyTheme(null, mode)
  return mode
}

// Auto follows the system setting live.
if (darkQuery) {
  const onSystemChange = function () {
    if (currentMode() === 'auto') applyTheme()
  }
  if (darkQuery.addEventListener) darkQuery.addEventListener('change', onSystemChange)
  else if (darkQuery.addListener) darkQuery.addListener(onSystemChange)
}

// The current brand colour, for script-drawn things such as the sun chart.
export function brandColor() {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim()
  return value || paletteById(DEFAULT_PALETTE).color
}

// Colours for script-drawn text (sun chart labels).
export function chartColors() {
  const dark = document.documentElement.getAttribute('data-mode') === 'dark'
  return dark
    ? { text: '#c8c8c8', bg: '#1e1e1e', fullDark: '#4a4a4a', twilight: '#8a8a8a' }
    : { text: '#666', bg: '#ffffff', fullDark: '#444', twilight: 'lightgrey' }
}
