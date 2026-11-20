import { defineAsyncComponent } from 'vue'
import Home from './Home.vue'
import Listing from './Listing.vue'
import Verse from './Verse.vue'
import Notifications from './Notifications.vue'
import LocationSetup from './LocationSetup.vue'

function lazy(loader) {
  return defineAsyncComponent(loader)
}

// Order in the menus. Home, Dates, Verse, and Count are the bottom tabs.
// Count stays out of the edge-swipe order so a wide swipe on that page does not leave it.
// Home, Dates, and Verse stay eager: Today renders all three. Location and
// Notifications are on that first screen too. The other pages load on visit.
const names = [
  { name: 'Home', path: '/', group: 'main', component: Home },
  { name: 'Listing', group: 'main', component: Listing },
  { name: 'Verse', group: 'main', component: Verse },
  { name: 'Counters', path: 'counters', group: 'main', swipe: false, hideHeader: true, title: 'Count', icon: '/statics/counter95.svg', component: lazy(() => import('./CounterVerses.vue')) },
  { name: 'Guide', path: 'guide', group: 'setup', swipe: false, title: 'Guide', icon: 'menu_book', component: lazy(() => import('./Guide.vue')) },
  { name: 'Notifications', group: 'setup', component: Notifications },
  { name: 'LocationSetup', group: 'setup', component: LocationSetup },
  { name: 'OtherSetup', group: ['setup', 'initial'], title: 'Other Settings', icon: 'language', component: lazy(() => import('./OtherSetup.vue')) },
  { name: 'ChangeLog', path: 'changelog', group: 'setup', swipe: false, title: 'Change log', icon: 'history', component: lazy(() => import('./ChangeLog.vue')) },
  { name: 'About', group: 'setup', title: 'About', icon: 'info', component: lazy(() => import('./About.vue')) },
  { name: 'Error404', path: '*', group: 'hidden', component: lazy(() => import('./Error404.vue')) }
]

function readData(component) {
  if (component && typeof component.data === 'function') {
    return component.data()
  }
  return {}
}

const routeInfoList = names.map(function (n) {
  const vueName = n.name
  const path = n.path || vueName.toLowerCase()
  const group = n.group || ''
  return {
    component: n.component,
    name: vueName,
    path: path,
    group: group,
    swipe: n.swipe !== false,
    hideHeader: n.hideHeader === true,
    key: vueName,
    title: n.title,
    icon: n.icon
  }
})

const menuPages = routeInfoList
  .filter(function (ri) {
    return !ri.group.includes('hidden')
  })
  .map(function (ri, i) {
    const data = readData(ri.component)
    return {
      to: ri.path,
      text: ri.title || data.title,
      icon: ri.icon || data.icon,
      index: '' + i,
      name: ri.name,
      group: ri.group,
      swipe: ri.swipe
    }
  })

function getNext(delta, currentRoute) {
  if (!currentRoute || !currentRoute.matched || !currentRoute.matched.length) {
    return null
  }
  var pages = menuPages.filter(function (page) {
    return page.swipe !== false
  })
  var path = currentRoute.matched[0].path.substring(1) || '/'
  var desired = -1
  for (var i = 0; i < pages.length; i++) {
    if (path === pages[i].to) {
      desired = i + delta
      break
    }
  }
  if (desired >= 0 && desired < pages.length) {
    return pages[desired].to
  }
  return null
}

const raw = routeInfoList.map(function (ri) {
  let path
  if (ri.path === '*') {
    path = '/:pathMatch(.*)*'
  } else if (ri.path === '/') {
    path = '/'
  } else {
    path = '/' + ri.path
  }
  return {
    component: ri.component,
    path: path,
    name: ri.name,
    key: ri.key,
    meta: { hideHeader: ri.hideHeader }
  }
})

export function registerPages(app) {
  routeInfoList.forEach(function (ri) {
    app.component(ri.name, ri.component)
  })
}

export default {
  raw: raw,
  menuPages: menuPages,
  getNext: getNext
}
