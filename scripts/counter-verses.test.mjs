import assert from 'node:assert/strict'
import test from 'node:test'

function installLocalStorage() {
  const mem = new Map()
  const localStorage = {
    getItem(key) { return mem.has(key) ? mem.get(key) : null },
    setItem(key, value) { mem.set(String(key), String(value)) },
    removeItem(key) { mem.delete(key) },
    clear() { mem.clear() },
    key(index) { return [...mem.keys()][index] ?? null },
    get length() { return mem.size }
  }
  globalThis.window = { localStorage }
  globalThis.localStorage = localStorage
}

installLocalStorage()

const mod = await import('../src/scripts/counterVerses.js')
const { decode } = await import('../src/scripts/storage.js')

const {
  verses,
  LEGACY_VERSE_ID,
  COUNTER_STORAGE_KEY,
  ensureSession,
  resetCounterSession,
  rememberCounter,
  selectVerse
} = mod

function storedCounter() {
  return decode(localStorage.getItem(COUNTER_STORAGE_KEY))
}

test.beforeEach(() => {
  localStorage.clear()
  resetCounterSession()
})

test('verse list matches the four research entries', () => {
  assert.deepEqual(verses.map((verse) => verse.id), [
    'allah-u-abha-95',
    'guidance-decision-19',
    'women-courses-95',
    'missed-prayers-18'
  ])
  assert.deepEqual(verses.map((verse) => verse.target), [95, 19, 95, 18])
  assert.equal(LEGACY_VERSE_ID, 'allah-u-abha-95')
  assert.equal(verses[0].text, 'Alláh-u-Abhá')
  assert.equal(verses[0].source, 'Bahá’u’lláh, Kitáb-i-Aqdas ¶18; Notes 33–34; Q&A 77; Synopsis IV.D.1.q')
  assert.equal(verses[0].url, 'https://www.bahai.org/library/authoritative-texts/bahaullah/kitab-i-aqdas/5#589705584')
  assert.equal(verses[0].group, 'daily')
  assert.equal(verses[1].text, 'Thou seest me, O my God, detached from all save Thee and cleaving unto Thee. Guide me, then, in all mine affairs unto that which profiteth me for the glory of Thy Cause and the loftiness of the station of Thy loved ones.')
  assert.equal(verses[1].url, 'https://www.bahai.org/library/authoritative-texts/bahaullah/additional-prayers-revealed-bahaullah/418930760/1#884624320')
  assert.equal(verses[2].text, 'Glorified be God, the Lord of Splendor and Beauty.')
  assert.equal(verses[2].url, 'https://www.bahai.org/library/authoritative-texts/bahaullah/kitab-i-aqdas/5#218902736')
  assert.equal(verses[3].text, 'Glorified be God, the Lord of the kingdoms of earth and heaven.')
  assert.equal(verses[3].source, 'Bahá’u’lláh, Kitáb-i-Aqdas ¶14; Q&A 60')
  assert.equal(verses[3].url, 'https://www.bahai.org/library/authoritative-texts/bahaullah/kitab-i-aqdas/5#433941746')
  assert.equal(verses[3].group, 'aqdas-substitutes')
})

test('migrates the saved 95 once and leaves the other verses at zero', () => {
  localStorage.setItem('tapNum', '__q_numb|17')
  localStorage.setItem('tapGroup95', '__q_numb|3')
  const session = ensureSession()
  assert.equal(session.counts[LEGACY_VERSE_ID].count, 17)
  assert.equal(session.counts[LEGACY_VERSE_ID].group, 3)
  for (const verse of verses) {
    if (verse.id !== LEGACY_VERSE_ID) {
      assert.equal(session.counts[verse.id].count, 0)
      assert.equal(session.counts[verse.id].group, 1)
    }
  }
  assert.equal(storedCounter().migrated, true)

  localStorage.setItem('tapNum', '__q_numb|1')
  resetCounterSession()
  const again = ensureSession()
  assert.equal(again.counts[LEGACY_VERSE_ID].count, 17)
  assert.equal(again.counts[LEGACY_VERSE_ID].group, 3)
})

test('each verse count is stored on its own, and Alláh-u-Abhá still writes tapNum', () => {
  localStorage.setItem('tapNum', '__q_numb|4')
  ensureSession()
  rememberCounter(verses[1].id, 2, 1)
  rememberCounter(LEGACY_VERSE_ID, 5, 1)
  resetCounterSession()
  const session = ensureSession()
  assert.equal(session.counts[LEGACY_VERSE_ID].count, 5)
  assert.equal(session.counts[verses[1].id].count, 2)
  assert.equal(session.counts[verses[2].id].count, 0)
  assert.equal(decode(localStorage.getItem('tapNum')), 5)
  assert.equal(decode(localStorage.getItem('tapGroup95')), 1)
})

test('a finished set stores 0 for the next load and keeps the target on screen', () => {
  ensureSession()
  rememberCounter(verses[3].id, 18, 2, { storedCount: 0, storedGroup: 1, locked: true })
  assert.equal(ensureSession().counts[verses[3].id].count, 18)
  assert.equal(storedCounter().counts[verses[3].id].count, 0)
  resetCounterSession()
  assert.equal(ensureSession().counts[verses[3].id].count, 0)
  assert.equal(ensureSession().counts[verses[3].id].group, 1)
})

test('remembers the selected verse', () => {
  ensureSession()
  selectVerse(verses[2].id)
  resetCounterSession()
  assert.equal(ensureSession().selectedId, verses[2].id)
})
