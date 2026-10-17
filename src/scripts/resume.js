// 2.4.6: an iPhone home-screen app (and a phone tab) is often frozen in the
// background and resumed later without a reload. When it comes back, update
// the date info right away and check for a new version of the app. At most
// once a minute, so switching apps quickly does no extra work.
import { doPulse } from './store'
import { checkForUpdate } from './swHandler'
import { isStandalone } from './platform'

const MIN_GAP_MS = 60 * 1000
let lastResume = Date.now()

function onResume() {
  const now = Date.now()
  if (now - lastResume < MIN_GAP_MS) return
  lastResume = now
  try {
    doPulse()
  } catch (e) {
    console.log('resume pulse failed', e && e.message ? e.message : e)
  }
  checkForUpdate()
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') onResume()
  })
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) onResume()
  })
}

// Ask once per launch for storage the browser will not clear on its own
// (settings and counts live in localStorage). Chrome and Safari decide quietly;
// Firefox on desktop shows a prompt, so it is only asked from an installed app.
export function requestPersistentStorage() {
  try {
    const storage = navigator.storage
    if (!storage || typeof storage.persist !== 'function' || typeof storage.persisted !== 'function') return
    const ua = navigator.userAgent || ''
    const promptingBrowser = /Firefox\//.test(ua) && !/Android/.test(ua)
    if (promptingBrowser && !isStandalone()) return
    storage.persisted().then(function (persisted) {
      if (persisted) return
      return storage.persist()
    }).catch(function () { })
  } catch (e) { }
}
