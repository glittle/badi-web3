/*
 * Repeatable verses for the counter page. The list is src/assets/repetition-verses.json.
 * Add another by appending one object. Required: id, title, text, source, url, target.
 * Optional, kept for later and not shown on the page: group, caveat.
 *
 * Wording is the authorized English on https://www.bahai.org/library.
 * Guidance is Bahá’u’lláh’s, in Additional Prayers, not a verse of the Báb.
 * The eighteen-fold verse in the Kitáb-i-Aqdas ¶14 is “the Lord of the kingdoms
 * of earth and heaven.” Questions and Answers, no. 60, says to recite it after
 * the last compensating prostration. ¶13 uses the library spelling “Splendor”.
 *
 * The home counter does not reset when the Badíʿ day ends at sunset. It keeps
 * the count until Reset. Tapping again on a finished target, with Continue
 * off, stores 0 for the next full load and leaves the number on screen at the
 * target. Each verse follows that same rule. The first verse, Alláh-u-Abhá,
 * is the existing home counter: its saved tapNum is copied in once.
 */
import { reactive } from 'vue'
import storage from './storage.js'
import rawVerses from '../assets/repetition-verses.json' with { type: 'json' }

function asVerse(raw) {
  return {
    id: raw.id,
    title: raw.title,
    text: raw.text,
    source: raw.source,
    url: raw.url || raw.sourceUrl || '',
    target: raw.target,
    group: raw.group,
    caveat: raw.caveat
  }
}

export const verses = rawVerses.map(asVerse)

export const LEGACY_VERSE_ID = (verses.find(function (verse) {
  return verse.text === 'Alláh-u-Abhá'
}) || verses[0]).id

export const COUNTER_STORAGE_KEY = 'counterVerses'

export const session = reactive({
  ready: false,
  selectedId: LEGACY_VERSE_ID,
  counts: {},
  locked: {}
})

let stored = null

function normalizeEntry(entry) {
  const count = entry && typeof entry.count === 'number' && entry.count >= 0 ? entry.count : 0
  const group = entry && typeof entry.group === 'number' && entry.group >= 1 ? entry.group : 1
  return { count: count, group: group }
}

function knownId(id) {
  return verses.some(function (verse) { return verse.id === id })
}

function snapshot() {
  const counts = {}
  verses.forEach(function (verse) {
    counts[verse.id] = normalizeEntry(stored.counts[verse.id])
  })
  return {
    selectedId: stored.selectedId,
    counts: counts,
    migrated: true
  }
}

function writeSnapshot() {
  storage.set(COUNTER_STORAGE_KEY, snapshot())
}

function readAndMigrate() {
  const raw = storage.get(COUNTER_STORAGE_KEY, null)
  const state = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  const previous = state.counts && typeof state.counts === 'object' ? state.counts : {}
  const counts = {}
  let dirty = !state.migrated
  verses.forEach(function (verse) {
    if (!previous[verse.id]) dirty = true
    counts[verse.id] = normalizeEntry(previous[verse.id])
  })
  if (!state.migrated) {
    const tapNum = storage.get('tapNum', 0)
    const tapGroup = storage.get('tapGroup95', 1)
    counts[LEGACY_VERSE_ID] = {
      count: typeof tapNum === 'number' && tapNum >= 0 ? tapNum : 0,
      group: typeof tapGroup === 'number' && tapGroup >= 1 ? tapGroup : 1
    }
    dirty = true
  }
  stored = {
    selectedId: knownId(state.selectedId) ? state.selectedId : LEGACY_VERSE_ID,
    counts: counts,
    migrated: true
  }
  if (dirty) writeSnapshot()
  return stored
}

export function resetCounterSession() {
  session.ready = false
  session.selectedId = LEGACY_VERSE_ID
  session.counts = {}
  session.locked = {}
  stored = null
}

export function ensureSession() {
  if (session.ready) return session
  const loaded = readAndMigrate()
  const counts = {}
  verses.forEach(function (verse) {
    counts[verse.id] = normalizeEntry(loaded.counts[verse.id])
  })
  session.selectedId = loaded.selectedId
  session.counts = counts
  session.locked = {}
  session.ready = true
  return session
}

function emitChange(id) {
  if (typeof window !== 'undefined' && window._messageBus) {
    window._messageBus.$emit('counterVerses', id)
  }
}

export function selectVerse(id) {
  if (!knownId(id)) return
  ensureSession()
  session.selectedId = id
  stored.selectedId = id
  writeSnapshot()
}

export function rememberCounter(id, displayCount, displayGroup, options) {
  if (!knownId(id)) return
  ensureSession()
  options = options || {}
  const entry = session.counts[id]
  entry.count = displayCount
  entry.group = displayGroup
  if (options.locked === true) session.locked[id] = true
  if (options.locked === false) session.locked[id] = false
  const storedCount = options.storedCount == null ? displayCount : options.storedCount
  const storedGroup = options.storedGroup == null ? displayGroup : options.storedGroup
  stored.counts[id] = { count: storedCount, group: storedGroup }
  stored.selectedId = session.selectedId
  writeSnapshot()
  if (id === LEGACY_VERSE_ID) {
    storage.set('tapNum', storedCount)
    storage.set('tapGroup95', storedGroup)
  }
  emitChange(id)
}

export function verseById(id) {
  for (let i = 0; i < verses.length; i++) {
    if (verses[i].id === id) return verses[i]
  }
  return verses[0]
}
