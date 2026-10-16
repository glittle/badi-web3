// What screen readers hear while counting (the polite live region on the
// Count and Today pages). Gong sounds are separate: only the Sound checkbox
// controls them. Saved in localStorage as tapAnnounce (__q_strn|off etc.).
import storage from './storage'

export const ANNOUNCE_MODES = [
  { id: 'off', nameKey: 'announceOff' },
  { id: 'milestones', nameKey: 'announceMilestones' },
  { id: 'every', nameKey: 'announceEvery' }
]

export const DEFAULT_ANNOUNCE = 'off'

export function currentAnnounceMode() {
  const id = storage.get('tapAnnounce', DEFAULT_ANNOUNCE)
  return ANNOUNCE_MODES.some(function (m) { return m.id === id }) ? id : DEFAULT_ANNOUNCE
}

export function setAnnounceMode(id) {
  storage.set('tapAnnounce', id)
}

// The words to say after a tap, or '' for nothing.
// done is the completion message key: a11yCountDone or a11yRoundDone.
export function tapAnnouncement(messages, count, total, round, doneKey) {
  const mode = currentAnnounceMode()
  if (mode === 'off') return ''
  const values = { count: count, total: total, round: round }
  if (count === total) return messages.get(doneKey, values)
  if (mode === 'every' || (total >= 19 && count % 19 === 0)) return messages.get('a11yCountOf', values)
  return ''
}

export function announcementsOn() {
  return currentAnnounceMode() !== 'off'
}
