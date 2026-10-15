import { createApp } from 'vue'
import './styles/quasar.mat.css'
import './styles/zoom.css'
import router from './router'
import store from './scripts/store'
import badiCalc from './scripts/badiCalc'
import createBus from './scripts/bus'
import { installAnalytics, gaHelper } from './scripts/analytics'
import touchSwipe from './directives/touch-swipe'
import { registerPages } from './pages/routes'

import QLayout from './components/ui/QLayout.vue'
import QToolbarTitle from './components/ui/QToolbarTitle.vue'
import QToggle from './components/ui/QToggle.vue'
import QRange from './components/ui/QRange.vue'
import QPopover from './components/ui/QPopover.vue'
import QDrawerLink from './components/ui/QDrawerLink.vue'

import msgDirective from './components/msg-directive'
import App from './App.vue'

import './scripts/swHandler'
import './scripts/stringExt'

import firebase from 'firebase/compat/app'
import 'firebase/compat/database'
import 'firebase/compat/messaging'

if (window.location.protocol === 'http:' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1') {
  window.location.href = window.location.href.replace('http:', 'https:')
}

window._messageBus = createBus()

const touch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)
document.body.classList.add(touch ? 'mobile' : 'desktop', 'mat')

installAnalytics(router)

const app = createApp(App)
app.use(router)
app.use(store)
app.config.globalProperties.$ga = gaHelper
app.directive('touch-swipe', touchSwipe)
app.directive('msg', msgDirective)
app.component('q-layout', QLayout)
app.component('q-toolbar-title', QToolbarTitle)
app.component('q-toggle', QToggle)
app.component('q-range', QRange)
app.component('q-popover', QPopover)
app.component('q-drawer-link', QDrawerLink)
registerPages(app)

app.mixin({
  created() {
    const head = this.$options.head
    if (!head || !head.title) return
    const spec = typeof head.title === 'function' ? head.title.call(this) : head.title
    if (!spec || !spec.inner) return
    document.title = spec.separator
      ? spec.inner + ' ' + spec.separator + ' Wondrous-Badíʿ Today'
      : spec.inner
  }
})

app.mount('#q-app')

const html = document.documentElement
html.setAttribute('dir', badiCalc.languageDir)
html.setAttribute('lang', badiCalc.languageCode)
document.body.classList.add(badiCalc.languageDir, badiCalc.languageCode, (badiCalc.languageCode || 'en').slice(0, 2))

const firebaseConfig = {
  apiKey: 'AIzaSyAWmZePN5vVblr3dww7HIpII398vwaGMiE',
  authDomain: 'wondrous-badi-today.firebaseapp.com',
  databaseURL: 'https://wondrous-badi-today.firebaseio.com',
  projectId: 'wondrous-badi-today',
  storageBucket: 'wondrous-badi-today.appspot.com',
  messagingSenderId: '201027632116'
}

try {
  firebase.initializeApp(firebaseConfig)
  // firebase/compat/database is imported above so window.firebase.database()
  // talks to wondrous-badi-today (databaseURL in the config). The 1.x app
  // initialized this project and used messaging; it did not open a database
  // listener on startup, so we don't either.
  try {
    const messaging = firebase.messaging()
    messaging.usePublicVapidKey('BOMJLq-GqaVDos-u3e7bexzHGf23ZADEVs03tpunmrPuox4vh0Lo6lOC8awEBK34IS09-OVJF8V2sRgqowqMsT0')
  } catch (err) {
    // Some browsers (and http://localhost) cannot start messaging. The page still runs.
  }
  window.firebase = firebase
} catch (err) {
  console.log('Firebase init failed', err && err.message ? err.message : err)
}
