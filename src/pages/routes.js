import Home from './Home.vue'
import Listing from './Listing.vue'
import Verse from './Verse.vue'
import Notifications from './Notifications.vue'
import LocationSetup from './LocationSetup.vue'
import OtherSetup from './OtherSetup.vue'
import About from './About.vue'
import CounterVerses from './CounterVerses.vue'
import Error404 from './Error404.vue'

// Order in the menus. Home, Dates, Verse, and Verses are the bottom tabs.
// Verses stays out of the edge-swipe order so a wide swipe on that page does not leave it.
const names = [
  { name: 'Home', path: '/', group: 'main', component: Home },
  { name: 'Listing', group: 'main', component: Listing },
  { name: 'Verse', group: 'main', component: Verse },
  { name: 'Counters', path: 'counters', group: 'main', swipe: false, component: CounterVerses },
  { name: 'Notifications', group: 'setup', component: Notifications },
  { name: 'LocationSetup', group: 'setup', component: LocationSetup },
  { name: 'OtherSetup', group: ['setup', 'initial'], component: OtherSetup },
  { name: 'About', group: 'setup', component: About },
  { name: 'Error404', path: '*', group: 'hidden', component: Error404 }
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
    key: vueName
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
      text: data.title,
      icon: data.icon,
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
    key: ri.key
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
