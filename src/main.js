import { createApp, nextTick } from 'vue'
import './styles/quasar.mat.css'
import './styles/zoom.css'
import router from './router'
import store from './scripts/store'
import badiCalc from './scripts/badiCalc'
import createBus from './scripts/bus'
import { installAnalytics } from './scripts/analytics'
import touchSwipe from './directives/touch-swipe'
import { registerPages } from './pages/routes'

import QLayout from './components/ui/QLayout.vue'
import QToolbarTitle from './components/ui/QToolbarTitle.vue'
import QToggle from './components/ui/QToggle.vue'
import QRange from './components/ui/QRange.vue'
import QPopover from './components/ui/QPopover.vue'
import QDrawerLink from './components/ui/QDrawerLink.vue'

import msgDirective from './components/msg-directive'
import messages from './scripts/messages'
import App from './App.vue'
import './styles/palette.css'
import './styles/a11y.css'
import './styles/theme.css'
import './styles/dark.css'
import './styles/safe-area.css'
import { applyTheme } from './scripts/palette'

import './scripts/swHandler'
import { requestPersistentStorage } from './scripts/resume'
import './scripts/stringExt'

if (window.location.protocol === 'http:' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1') {
  window.location.href = window.location.href.replace('http:', 'https:')
}

window._messageBus = createBus()

const touch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)
document.body.classList.add(touch ? 'mobile' : 'desktop', 'mat')

installAnalytics(router)

// index.html already set the palette and light/dark mode before first paint;
// this also covers a stored value it could not read, keeps theme-color in step
// and starts following the system setting for Auto.
applyTheme()
requestPersistentStorage()

const app = createApp(App)
app.use(router)
app.use(store)
// Template helper for strings in locales/en/*.json: $msg('key', { count: 3 })
app.config.globalProperties.$msg = function (key, obj) { return messages.get(key, obj) }
app.directive('touch-swipe', touchSwipe)
app.directive('msg', msgDirective)
app.component('q-layout', QLayout)
app.component('q-toolbar-title', QToolbarTitle)
app.component('q-toggle', QToggle)
app.component('q-range', QRange)
app.component('q-popover', QPopover)
app.component('q-drawer-link', QDrawerLink)
registerPages(app)

// Every navigation sets the page title from the route (keep-alive pages are not
// remounted, so a mounted() hook alone left a stale title), and moves focus to
// the new page's heading so screen readers announce where they are.
const appTitle = document.title

function pageTitle(route) {
  const name = route && route.name
  if (!name) return appTitle
  return messages.get('pageTitle', { page: messages.get('pageTitle' + name), app: appTitle })
}

function focusPageHeading() {
  const views = Array.from(document.querySelectorAll('#main .layout-view'))
  const view = views.find(function (el) { return el.offsetParent !== null || el.getClientRects().length }) || views[0]
  const target = (view && view.querySelector('[data-page-heading]')) || document.getElementById('main')
  if (!target) return
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
  try {
    target.focus({ preventScroll: true })
  } catch (e) {
    target.focus()
  }
}

let firstNavigation = true
router.afterEach(function (to, from) {
  document.title = pageTitle(to)
  if (firstNavigation) {
    firstNavigation = false
    return
  }
  if (from && to.fullPath === from.fullPath) return
  nextTick(function () {
    window.requestAnimationFrame(focusPageHeading)
  })
})

app.mount('#q-app')

const html = document.documentElement
html.setAttribute('dir', badiCalc.languageDir)
html.setAttribute('lang', badiCalc.languageCode)
document.body.classList.add(badiCalc.languageDir, badiCalc.languageCode, (badiCalc.languageCode || 'en').slice(0, 2))
