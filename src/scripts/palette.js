// Colour palettes. The CSS lives in styles/palette.css; index.html applies the
// saved palette before first paint. Contrast is white-on-primary and
// primary-on-white (the same ratio).
import storage from './storage'

export const PALETTES = [
  { id: 'blue', nameKey: 'paletteBlue', color: '#2471a3', contrast: '5.30' },
  { id: 'teal', nameKey: 'paletteTeal', color: '#1f6f6b', contrast: '5.92' },
  { id: 'green', nameKey: 'paletteGreen', color: '#3d6b45', contrast: '6.20' },
  { id: 'plum', nameKey: 'palettePlum', color: '#7a4a7d', contrast: '6.77' }
]

export const DEFAULT_PALETTE = 'blue'

export function paletteById(id) {
  return PALETTES.find(function (p) { return p.id === id }) || PALETTES[0]
}

export function currentPaletteId() {
  return paletteById(storage.get('palette', DEFAULT_PALETTE)).id
}

export function applyPalette(id) {
  const palette = paletteById(id)
  document.documentElement.setAttribute('data-palette', palette.id)
  let meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', palette.color)
  return palette
}

export function setPalette(id) {
  const palette = applyPalette(id)
  storage.set('palette', palette.id)
  return palette
}

// The current brand colour, for script-drawn things such as the sun chart.
export function brandColor() {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim()
  return value || paletteById(DEFAULT_PALETTE).color
}
